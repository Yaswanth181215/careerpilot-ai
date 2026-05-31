import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CodingSubmission } from '../models/codingSubmission.model';
import { User } from '../models/user.model';
import { CodeRunnerService } from '../services/codeRunner.service';
import { AppEventBus, AppEventNames, ValidationError } from '@careerpilot/shared';

// Predefined coding challenges datasets
const PROBLEM_TEST_CASES: Record<string, { input: string; expected: string }[]> = {
  'two-sum': [
    { input: '9\n2 7 11 15', expected: '0 1' },
    { input: '6\n3 2 4', expected: '1 2' },
  ],
  'reverse-string': [
    { input: 'hello', expected: 'olleh' },
    { input: 'world', expected: 'dlrow' },
  ],
};

export class CodingController {
  public static async submit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { problemId, language, code } = req.body;
      const userId = req.user?.userId;

      if (!userId) throw new ValidationError('Invalid session user');

      const testCases = PROBLEM_TEST_CASES[problemId];
      if (!testCases) {
        throw new ValidationError(`Problem ID '${problemId}' is invalid or does not have test cases configured.`);
      }

      const results = [];
      let allPassed = true;

      // Loop through test cases
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        
        // Wrap user JS code to parse input and call function
        let runCode = code;
        if (language === 'javascript') {
          runCode = `
            ${code}
            const input = stdin.trim().split('\\n');
            if (input.length > 1) {
              const target = parseInt(input[0]);
              const nums = input[1].split(' ').map(Number);
              console.log(twoSum(nums, target).join(' '));
            } else {
              console.log(reverseString(input[0]));
            }
          `;
        }

        const execution = await CodeRunnerService.execute(language, runCode, tc.input);
        
        const actual = execution.stdout.trim();
        const passed = actual === tc.expected.trim() && !execution.error;
        if (!passed) allPassed = false;

        results.push({
          testCaseId: `case-${i + 1}`,
          passed,
          input: tc.input,
          expected: tc.expected,
          actual: actual || (execution.error ? `Error: ${execution.error}` : ''),
          error: execution.error || execution.stderr,
        });
      }

      // Save submission document
      const submission = new CodingSubmission({
        userId,
        problemId,
        language,
        code,
        runtime: Math.round(Math.random() * 50 + 10), // Mock runtime duration
        memory: Math.round(Math.random() * 2000 + 4000), // Mock memory footprint
        passed: allPassed,
        results,
      });
      await submission.save();

      // Add XP to user
      if (allPassed) {
        const user = await User.findById(userId);
        if (user) {
          user.xp += 50; // Solve coding challenge awards 50 XP
          user.level = Math.floor(user.xp / 500) + 1;
          await user.save();
        }
      }

      // Publish event
      await AppEventBus.publish(AppEventNames.CODING_SUBMITTED, {
        userId,
        problemId,
        passed: allPassed,
      });

      res.json({
        success: true,
        passed: allPassed,
        runtime: submission.runtime,
        memory: submission.memory,
        results: submission.results,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const submissions = await CodingSubmission.find({ userId }).sort({ createdAt: -1 });
      res.json({ success: true, submissions });
    } catch (error) {
      next(error);
    }
  }
}
