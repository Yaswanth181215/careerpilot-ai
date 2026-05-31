import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { logger } from '@careerpilot/shared';

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  source: 'Docker' | 'Piston' | 'VM';
}

export class CodeRunnerService {
  private static TEMP_DIR = path.join(process.cwd(), 'temp_execution');

  constructor() {
    if (!fs.existsSync(CodeRunnerService.TEMP_DIR)) {
      fs.mkdirSync(CodeRunnerService.TEMP_DIR, { recursive: true });
    }
  }

  public static async execute(
    language: 'javascript' | 'python' | 'java' | 'cpp',
    code: string,
    stdin = ''
  ): Promise<CodeExecutionResult> {
    logger.info(`[CodeRunner] Executing code in ${language}`);

    // Tier 1: Isolated Docker Execution
    try {
      return await this.runInDocker(language, code, stdin);
    } catch (dockerError: any) {
      logger.warn('[CodeRunner] Docker execution failed or is unavailable. Falling back to Piston API.', {
        error: dockerError.message,
      });

      // Tier 2: Piston API Execution
      try {
        return await this.runInPiston(language, code, stdin);
      } catch (pistonError: any) {
        logger.warn('[CodeRunner] Piston execution failed. Falling back to local restricted VM.', {
          error: pistonError.message,
        });

        // Tier 3: In-process restricted VM (Only supports JavaScript)
        if (language === 'javascript') {
          return this.runInVM(code, stdin);
        } else {
          return {
            stdout: '',
            stderr: '',
            error: 'Docker and Piston failed. VM execution only supports JavaScript.',
            source: 'VM',
          };
        }
      }
    }
  }

  // --- TIER 1: DOCKER CONTAINER SANDBOX ---
  private static async runInDocker(
    language: string,
    code: string,
    stdin: string
  ): Promise<CodeExecutionResult> {
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }

    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let fileName = '';
    let dockerImage = '';
    let cmdArgs: string[] = [];

    switch (language) {
      case 'javascript':
        fileName = `code_${uniqueId}.js`;
        dockerImage = 'node:18-alpine';
        cmdArgs = ['node', fileName];
        break;
      case 'python':
        fileName = `code_${uniqueId}.py`;
        dockerImage = 'python:3.10-alpine';
        cmdArgs = ['python', fileName];
        break;
      default:
        throw new Error(`Docker execution not implemented for language: ${language}`);
    }

    const filePath = path.join(this.TEMP_DIR, fileName);
    fs.writeFileSync(filePath, code);

    // Build the docker command
    // Set memory limit to 128MB and CPU limit to 0.5 core. Set runtime timeout limit to 5s.
    const dockerArgs = [
      'run',
      '--rm',
      '--network', 'none', // no internet access
      '--memory', '128m',
      '--cpus', '0.5',
      '-v', `${this.TEMP_DIR}:/app`,
      '-w', '/app',
      dockerImage,
      ...cmdArgs,
    ];

    try {
      const result = spawnSync('docker', dockerArgs, {
        input: stdin,
        timeout: 5000, // 5 seconds timeout
        encoding: 'utf-8',
      });

      // Cleanup
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        source: 'Docker',
      };
    } catch (err: any) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw err;
    }
  }

  // --- TIER 2: PISTON RUNNER API ---
  private static async runInPiston(
    language: string,
    code: string,
    stdin: string
  ): Promise<CodeExecutionResult> {
    const langMap: Record<string, string> = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
    };

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language,
        version: '*',
        files: [{ name: `main.${langMap[language] || 'txt'}`, content: code }],
        stdin: stdin,
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      stdout: data.run.stdout || '',
      stderr: data.run.stderr || '',
      error: data.run.output && data.run.code !== 0 ? data.run.output : undefined,
      source: 'Piston',
    };
  }

  // --- TIER 3: RESTRICTED LOCAL JS VM ---
  private static runInVM(code: string, stdin: string): CodeExecutionResult {
    let output = '';
    let errorMsg = '';

    const sandbox = {
      console: {
        log: (...args: any[]) => {
          output += args.map((x) => (typeof x === 'object' ? JSON.stringify(x) : x)).join(' ') + '\n';
        },
        error: (...args: any[]) => {
          errorMsg += args.join(' ') + '\n';
        },
      },
      stdin: stdin,
    };

    const context = vm.createContext(sandbox);

    try {
      vm.runInContext(code, context, {
        timeout: 2000, // 2 seconds timeout to prevent infinite loops
      });

      return {
        stdout: output,
        stderr: errorMsg,
        source: 'VM',
      };
    } catch (err: any) {
      return {
        stdout: output,
        stderr: errorMsg + '\n' + err.message,
        error: err.message,
        source: 'VM',
      };
    }
  }
}
