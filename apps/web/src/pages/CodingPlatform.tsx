import React, { useState } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import Editor from '@monaco-editor/react';
import { Code2, Play, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: Record<string, string>;
}

const PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    return []`,
    },
  },
  {
    id: 'reverse-string',
    title: '2. Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.
You must do this by modifying the input array in-place with O(1) extra memory.`,
    starterCode: {
      javascript: `function reverseString(s) {\n  // Write your code here\n  return s.split('').reverse().join('');\n}`,
      python: `def reverse_string(s: str) -> str:\n    # Write your code here\n    return s[::-1]`,
    },
  },
];

export const CodingPlatform: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState(selectedProblem.starterCode[language]);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);

  const handleProblemChange = (prob: Problem) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode[language]);
    setResults(null);
    setPassed(null);
  };

  const handleLanguageChange = (lang: 'javascript' | 'python') => {
    setLanguage(lang);
    setCode(selectedProblem.starterCode[lang] || '');
    setResults(null);
    setPassed(null);
  };

  const submitSolution = async () => {
    setLoading(true);
    setResults(null);
    setPassed(null);
    try {
      const response = await ApiClient.request('/coding/submit', {
        method: 'POST',
        body: JSON.stringify({
          problemId: selectedProblem.id,
          language,
          code,
        }),
      });
      setResults(response.results);
      setPassed(response.passed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      {/* Problem details panel */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
        <Card hoverable={false} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-400" />
            <span>Select Challenge</span>
          </h2>
          <div className="flex flex-col gap-2">
            {PROBLEMS.map((prob) => (
              <button
                key={prob.id}
                onClick={() => handleProblemChange(prob)}
                className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedProblem.id === prob.id
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                    : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60'
                }`}
              >
                {prob.title}
              </button>
            ))}
          </div>
        </Card>

        <Card hoverable={false} className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{selectedProblem.title}</h3>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/20">
              {selectedProblem.difficulty}
            </span>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {selectedProblem.description}
          </div>
        </Card>
      </div>

      {/* Editor & Execution Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <Card hoverable={false} className="flex-1 flex flex-col p-4 overflow-hidden min-h-[380px]">
          <div className="flex justify-between items-center mb-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
            </select>

            <Button
              onClick={submitSolution}
              disabled={loading}
              className="px-5 py-2 text-xs flex items-center gap-1.5"
            >
              {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              <span>{loading ? 'Evaluating...' : 'Run Test Cases'}</span>
            </Button>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
              }}
            />
          </div>
        </Card>

        {/* Test execution logs output */}
        {results && (
          <Card hoverable={false} className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {passed ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>All test cases passed! (+50 XP)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-400 text-sm font-bold">
                  <XCircle className="h-4 w-4" />
                  <span>Some test cases failed. Try again.</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {results.map((res, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                    res.passed
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex justify-between font-semibold">
                    <span>Test Case {idx + 1}</span>
                    <span className={res.passed ? 'text-emerald-400' : 'text-red-400'}>
                      {res.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-1 font-mono text-[10px] text-slate-400">
                    <div>
                      <p>Input: {res.input.replace('\n', ' ')}</p>
                      <p>Expected: {res.expected}</p>
                    </div>
                    <div>
                      <p className={res.passed ? 'text-slate-400' : 'text-red-300'}>
                        Actual Output: {res.actual}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
export default CodingPlatform;
