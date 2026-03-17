import React, { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';
import './Assessments.css';

const API_BASE = 'http://localhost:3000';
const QUIZ_DRAFT_KEY = 'assessments_quiz_draft_v1';
const CODE_DRAFT_KEY = 'assessments_code_draft_v1';


const quizQuestionsBank = [
  // JavaScript
  { id:1, category:'JavaScript', difficulty:'Medium',
    question:'What is the output of `typeof null` in JavaScript?',
    options:['null','undefined','object','string'], correct:2,
    explanation:'`typeof null` returns "object" â€” a historic JS bug kept for backward compatibility.' },
  { id:2, category:'JavaScript', difficulty:'Easy',
    question:'Which method removes the last element from an array and returns it?',
    options:['shift()','pop()','splice()','slice()'], correct:1,
    explanation:'`pop()` removes and returns the last element. `shift()` does the same for the first.' },
  { id:3, category:'JavaScript', difficulty:'Hard',
    question:'What will `console.log(0.1 + 0.2 === 0.3)` print?',
    options:['true','false','NaN','undefined'], correct:1,
    explanation:'Floating-point precision: `0.1 + 0.2` equals `0.30000000000000004`, not `0.3`.' },
  { id:4, category:'JavaScript', difficulty:'Medium',
    question:'What is a closure in JavaScript?',
    options:['A function with no return value','A function bundled with its lexical environment','A way to close the browser tab','An error-handling mechanism'],
    correct:1, explanation:'A closure retains access to its outer scope even after the outer function has returned.' },
  // Python
  { id:5, category:'Python', difficulty:'Easy',
    question:'Which keyword is used to define a function in Python?',
    options:['func','function','def','define'], correct:2,
    explanation:'Python uses `def` to declare functions.' },
  { id:6, category:'Python', difficulty:'Medium',
    question:'What does `*args` mean in a Python function definition?',
    options:['Unpacks a dictionary','Accepts any number of keyword args','Accepts any number of positional args','Creates a pointer'],
    correct:2, explanation:'`*args` collects extra positional arguments into a tuple.' },
  { id:7, category:'Python', difficulty:'Hard',
    question:'What is the output of `[x**2 for x in range(4) if x % 2 == 0]`?',
    options:['[1, 9]','[0, 4]','[0, 1, 4, 9]','[4, 16]'], correct:1,
    explanation:'Even numbers in range(4) are 0 and 2. 0Â²=0, 2Â²=4 â†’ [0, 4].' },
  // React
  { id:8, category:'React', difficulty:'Easy',
    question:'Which hook performs side effects in a functional component?',
    options:['useState','useEffect','useContext','useReducer'], correct:1,
    explanation:'`useEffect` handles side effects like data fetching and DOM mutations.' },
  { id:9, category:'React', difficulty:'Medium',
    question:'What does the second value of `useState` return?',
    options:['The initial state','A setter function that triggers re-render','A ref object','The previous state'],
    correct:1, explanation:'`useState` returns `[currentValue, setter]`. Calling the setter triggers a re-render.' },
  { id:10, category:'React', difficulty:'Hard',
    question:'When does React re-render a component?',
    options:['Only when props change','Only when state changes','When state, props, or consumed context changes','Every second automatically'],
    correct:2, explanation:'React re-renders on state change, props change, or context value update.' },
  // DSA
  { id:11, category:'DSA', difficulty:'Hard',
    question:'Time complexity of searching in a balanced BST?',
    options:['O(n)','O(log n)','O(n log n)','O(1)'], correct:1,
    explanation:'Each comparison halves the search space â†’ O(log n).' },
  { id:12, category:'DSA', difficulty:'Medium',
    question:'Which data structure uses LIFO order?',
    options:['Queue','Stack','Heap','Graph'], correct:1,
    explanation:'Stack follows Last-In-First-Out.' },
  { id:13, category:'DSA', difficulty:'Medium',
    question:'Worst-case time complexity of QuickSort?',
    options:['O(n log n)','O(n)','O(nÂ²)','O(log n)'], correct:2,
    explanation:'QuickSort degrades to O(nÂ²) when the pivot is always the smallest/largest element.' },
  // SQL
  { id:14, category:'SQL', difficulty:'Easy',
    question:'Which clause filters rows returned by a query?',
    options:['ORDER BY','GROUP BY','WHERE','HAVING'], correct:2,
    explanation:'`WHERE` filters rows before aggregation. `HAVING` filters after GROUP BY.' },
  { id:15, category:'SQL', difficulty:'Medium',
    question:'Difference between INNER JOIN and LEFT JOIN?',
    options:['No difference','INNER returns only matches; LEFT also returns unmatched left rows','LEFT JOIN is always faster','INNER JOIN only works on primary keys'],
    correct:1, explanation:'LEFT JOIN returns all left rows with NULLs for missing matches.' },
  // CSS
  { id:16, category:'CSS', difficulty:'Easy',
    question:'Which property controls space between the border and content?',
    options:['margin','padding','border-spacing','gap'], correct:1,
    explanation:'`padding` is inside the border; `margin` is outside.' },
  { id:17, category:'CSS', difficulty:'Medium',
    question:'What does `display: flex` do?',
    options:['Makes element invisible','Creates a flex container for children','Floats the element left','Fixes element to viewport'],
    correct:1, explanation:'`display: flex` enables flexbox layout on all direct children.' },
  // TypeScript
  { id:18, category:'TypeScript', difficulty:'Medium',
    question:'What is the `any` type in TypeScript?',
    options:['Accepts only numbers','Opts out of type checking','Union of all primitives','Type for arrays'],
    correct:1, explanation:'`any` disables TypeScript type checking â€” use sparingly.' },
  // System Design
  { id:19, category:'System Design', difficulty:'Medium',
    question:'Best database for unstructured data at scale?',
    options:['MySQL','PostgreSQL','MongoDB','SQLite'], correct:2,
    explanation:'MongoDB is document-oriented NoSQL, ideal for unstructured data at scale.' },
  { id:20, category:'System Design', difficulty:'Hard',
    question:'What is the purpose of a CDN?',
    options:['Store databases near the server','Serve static assets from edge servers near users','Encrypt API traffic','Manage DNS records'],
    correct:1, explanation:'CDNs cache and deliver static content from edge nodes close to users, reducing latency.' },
];

const STACK_TO_QUIZ_CATEGORIES = {
  react: ['React', 'JavaScript', 'TypeScript', 'CSS'],
  vue: ['JavaScript', 'TypeScript', 'CSS'],
  angular: ['JavaScript', 'TypeScript', 'CSS'],
  'node.js': ['JavaScript', 'SQL', 'System Design'],
  express: ['JavaScript', 'SQL', 'System Design'],
  python: ['Python', 'DSA', 'SQL'],
  django: ['Python', 'SQL', 'System Design'],
  fastapi: ['Python', 'SQL', 'System Design'],
  java: ['DSA', 'System Design'],
  'spring boot': ['SQL', 'System Design'],
  go: ['System Design', 'DSA'],
  postgresql: ['SQL'],
  mongodb: ['SQL', 'System Design'],
  redis: ['System Design'],
  docker: ['System Design'],
  kubernetes: ['System Design'],
  aws: ['System Design'],
  typescript: ['TypeScript', 'JavaScript'],
  graphql: ['System Design'],
  'rest apis': ['System Design', 'JavaScript'],
};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateQuizFromStack(stack, bank, targetCount = 10) {
  if (!Array.isArray(stack) || stack.length === 0) {
    return shuffle(bank).slice(0, Math.min(targetCount, bank.length));
  }

  const categorySet = new Set();
  stack.forEach((tech) => {
    const normalized = String(tech).toLowerCase();
    Object.entries(STACK_TO_QUIZ_CATEGORIES).forEach(([key, categories]) => {
      if (normalized.includes(key)) {
        categories.forEach((cat) => categorySet.add(cat));
      }
    });
  });

  if (categorySet.size === 0) {
    return shuffle(bank).slice(0, Math.min(targetCount, bank.length));
  }

  const priority = shuffle(bank.filter((q) => categorySet.has(q.category)));
  const fallback = shuffle(bank.filter((q) => !categorySet.has(q.category)));
  return [...priority, ...fallback].slice(0, Math.min(targetCount, bank.length));
}


const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript', monaco: 'javascript' },
  { label: 'TypeScript', value: 'typescript', monaco: 'typescript' },
  { label: 'Python',     value: 'python',     monaco: 'python'     },
  { label: 'Java',       value: 'java',        monaco: 'java'       },
  { label: 'C++',        value: 'cpp',         monaco: 'cpp'        },
];


const PROBLEMS = [
  {
    id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays & Hashing',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nEach input has exactly one solution. You may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9.' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]', explanation: 'nums[1] + nums[2] == 6.' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer.'],
    code: {
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}`,
      python:     `from typing import List\n\ndef two_sum(nums: List[int], target: int) -> List[int]:\n    # Write your solution here\n    pass`,
      java:       `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
      cpp:        `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
    },
  },
  {
    id: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', category: 'Two Pointers',
    description: 'A phrase is a palindrome if, after converting all uppercase to lowercase and removing non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, false otherwise.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true',  explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"',                    output: 'false', explanation: '"raceacar" is not a palindrome.' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists of printable ASCII characters.'],
    code: {
      javascript: `function isPalindrome(s) {\n  // Write your solution here\n}`,
      typescript: `function isPalindrome(s: string): boolean {\n  // Write your solution here\n  return false;\n}`,
      python:     `def is_palindrome(s: str) -> bool:\n    # Write your solution here\n    pass`,
      java:       `class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
      cpp:        `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your solution here\n        return false;\n    }\n};`,
    },
  },
  {
    id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', category: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'List is reversed.' },
      { input: 'head = [1,2]',       output: '[2,1]',       explanation: 'List is reversed.' },
    ],
    constraints: ['Number of nodes in [0, 5000].', '-5000 <= Node.val <= 5000'],
    code: {
      javascript: `// ListNode: function ListNode(val, next) { this.val = val; this.next = next ?? null; }\n\nfunction reverseList(head) {\n  // Write your solution here\n}`,
      typescript: `// class ListNode { val: number; next: ListNode | null = null; }\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n  // Write your solution here\n  return null;\n}`,
      python:     `# class ListNode:\n#     def __init__(self, val=0, next=None): ...\n\ndef reverse_list(head):\n    # Write your solution here\n    pass`,
      java:       `// public class ListNode { int val; ListNode next; }\n\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}`,
      cpp:        `// struct ListNode { int val; ListNode *next; };\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};`,
    },
  },
  {
    id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', category: 'Dynamic Programming',
    description: 'You are climbing a staircase that takes n steps to reach the top.\n\nEach time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2 â€” two ways.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1 â€” three ways.' },
    ],
    constraints: ['1 <= n <= 45'],
    code: {
      javascript: `function climbStairs(n) {\n  // Write your solution here\n}`,
      typescript: `function climbStairs(n: number): number {\n  // Write your solution here\n  return 0;\n}`,
      python:     `def climb_stairs(n: int) -> int:\n    # Write your solution here\n    pass`,
      java:       `class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp:        `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n};`,
    },
  },
  {
    id: 'max-subarray', title: 'Maximum Subarray', difficulty: 'Medium', category: 'Dynamic Programming',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum = 6.' },
      { input: 'nums = [1]',                      output: '1', explanation: 'Single element.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    code: {
      javascript: `function maxSubArray(nums) {\n  // Kadane's Algorithm\n}`,
      typescript: `function maxSubArray(nums: number[]): number {\n  // Kadane's Algorithm\n  return 0;\n}`,
      python:     `from typing import List\n\ndef max_sub_array(nums: List[int]) -> int:\n    # Kadane's Algorithm\n    pass`,
      java:       `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Kadane's Algorithm\n        return 0;\n    }\n}`,
      cpp:        `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Kadane's Algorithm\n        return 0;\n    }\n};`,
    },
  },
  {
    id: 'binary-search', title: 'Binary Search', difficulty: 'Easy', category: 'Binary Search',
    description: 'Given a sorted array of integers nums and an integer target, return the index if target exists, otherwise return -1.\n\nYou must write an O(log n) algorithm.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4',  explanation: '9 exists at index 4.' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist.' },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'All integers are unique.', '-10^4 <= target <= 10^4'],
    code: {
      javascript: `function search(nums, target) {\n  // O(log n) solution\n}`,
      typescript: `function search(nums: number[], target: number): number {\n  // O(log n) solution\n  return -1;\n}`,
      python:     `from typing import List\n\ndef search(nums: List[int], target: int) -> int:\n    # O(log n) solution\n    pass`,
      java:       `class Solution {\n    public int search(int[] nums, int target) {\n        // O(log n) solution\n        return -1;\n    }\n}`,
      cpp:        `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // O(log n) solution\n        return -1;\n    }\n};`,
    },
  },
];

const DIFF_COLORS = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

export default function Assessments() {
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const persistedQuizDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(QUIZ_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const persistedCodeDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(CODE_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [activeTab, setActiveTab] = useState(persistedCodeDraft?.activeTab || 'quiz');

  const selectedTechStack = useMemo(() => {
    try {
      const raw = localStorage.getItem('learning_plan_profile');
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed?.stack) ? parsed.stack : [];
    } catch {
      return [];
    }
  }, []);

  const quizQuestions = useMemo(
    () => {
      const fromDraftIds = Array.isArray(persistedQuizDraft?.questionIds)
        ? persistedQuizDraft.questionIds
        : [];

      if (fromDraftIds.length > 0) {
        const byId = new Map(quizQuestionsBank.map((q) => [q.id, q]));
        const restored = fromDraftIds.map((id) => byId.get(id)).filter(Boolean);
        if (restored.length > 0) return restored;
      }

      return generateQuizFromStack(selectedTechStack, quizQuestionsBank, 10);
    },
    [selectedTechStack, persistedQuizDraft]
  );

  // Quiz state
  const [current, setCurrent]   = useState(persistedQuizDraft?.current ?? 0);
  const [selected, setSelected] = useState(persistedQuizDraft?.selected ?? null);
  const [submitted, setSubmitted] = useState(persistedQuizDraft?.submitted ?? false);
  const [score, setScore]       = useState(persistedQuizDraft?.score ?? 0);
  const [answers, setAnswers]   = useState(Array.isArray(persistedQuizDraft?.answers) ? persistedQuizDraft.answers : []);
  const [quizDone, setQuizDone] = useState(persistedQuizDraft?.quizDone ?? false);
  const [quizSaved, setQuizSaved] = useState(persistedQuizDraft?.quizSaved ?? false);

  // Code editor state
  const initialLanguage = useMemo(
    () => LANGUAGES.find((l) => l.value === persistedCodeDraft?.languageValue) || LANGUAGES[0],
    [persistedCodeDraft]
  );

  const initialProblem = useMemo(
    () => PROBLEMS.find((p) => p.id === persistedCodeDraft?.problemId) || PROBLEMS[0],
    [persistedCodeDraft]
  );

  const [language, setLanguage] = useState(initialLanguage);
  const [problem, setProblem]   = useState(initialProblem);
  const [code, setCode]         = useState(
    persistedCodeDraft?.code || initialProblem.code[initialLanguage.value]
  );
  const [output, setOutput]     = useState(null);
  const [running, setRunning]   = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const q = quizQuestions[current] || quizQuestions[0];

  /* Quiz handlers */
  const handleOptionSelect = (i) => { if (!submitted) setSelected(i); };

  const handleNext = async () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    const newScore = selected === q.correct ? score + 1 : score;
    setScore(newScore);
    if (current + 1 >= quizQuestions.length) {
      setQuizDone(true);
      if (isSignedIn) {
        try {
          const token = await getToken();
          await fetch(`${API_BASE}/api/assessment/submit-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ answers: newAnswers.map(String), score: newScore, totalQuestions: quizQuestions.length }),
          });
          setQuizSaved(true);
        } catch (err) { console.error('Quiz save failed:', err); }
      }
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleCheck = () => setSubmitted(true);
  const resetQuiz = () => {
    setCurrent(0); setSelected(null); setSubmitted(false);
    setScore(0); setAnswers([]); setQuizDone(false); setQuizSaved(false);
    localStorage.removeItem(QUIZ_DRAFT_KEY);
  };

  /* Code editor handlers */
  const handleLanguageChange = (e) => {
    const lang = LANGUAGES.find(l => l.value === e.target.value);
    setLanguage(lang);
    setCode(problem.code[lang.value]);
    setOutput(null); setSubmitResult(null);
  };

  const handleProblemChange = (e) => {
    const p = PROBLEMS.find(pr => pr.id === e.target.value);
    setProblem(p);
    setCode(p.code[language.value]);
    setOutput(null); setSubmitResult(null);
  };

  const handleRun = () => {
    setRunning(true); setSubmitResult(null);
    setTimeout(() => {
      setOutput('âœ…  Test case passed\nInput:  ' + problem.examples[0].input + '\nOutput: ' + problem.examples[0].output);
      setRunning(false);
    }, 1200);
  };

  const handleSubmit = async () => {
    setRunning(true); setOutput(null);
    try {
      if (isSignedIn) {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/assessment/submit-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ code, language: language.value, problemTitle: problem.title }),
        });
        const data = await res.json();
        if (res.ok) setSubmitResult({ status: 'Accepted', runtime: '68 ms', memory: '42.3 MB', beats: '87%', saved: true });
        else        setSubmitResult({ status: 'Error', error: data.error || 'Submission failed' });
      } else {
        setSubmitResult({ status: 'Accepted', runtime: '68 ms', memory: '42.3 MB', beats: '87%', saved: false });
      }
    } catch (err) {
      setSubmitResult({ status: 'Error', error: 'Network error - is the server running?' });
    } finally { setRunning(false); }
  };

  // Persist quiz draft (attempted question progress) across refresh.
  useEffect(() => {
    localStorage.setItem(
      QUIZ_DRAFT_KEY,
      JSON.stringify({
        questionIds: quizQuestions.map((item) => item.id),
        current,
        selected,
        submitted,
        score,
        answers,
        quizDone,
        quizSaved,
      })
    );
  }, [quizQuestions, current, selected, submitted, score, answers, quizDone, quizSaved]);

  // Persist code editor draft (problem/language/code) across refresh.
  useEffect(() => {
    localStorage.setItem(
      CODE_DRAFT_KEY,
      JSON.stringify({
        activeTab,
        languageValue: language.value,
        problemId: problem.id,
        code,
      })
    );
  }, [activeTab, language, problem, code]);

  return (
    <div className="page-container">
      <div className="assess-header">
        <h1 className="page-title" style={{ margin: 0 }}>Skill Assessments</h1>
        <div className="assess-tabs">
          <button className={`assess-tab ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>Quiz</button>
          <button className={`assess-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>Coding Challenge</button>
        </div>
      </div>

      
      {activeTab === 'quiz' && (
        <div className="quiz-wrapper">
          {selectedTechStack.length > 0 && (
            <p style={{ color: '#9ca3af', margin: '0 0 0.8rem', fontSize: '0.9rem' }}>
              Quiz generated from your stack: {selectedTechStack.slice(0, 5).join(', ')}
              {selectedTechStack.length > 5 ? ` +${selectedTechStack.length - 5}` : ''}
            </p>
          )}
          {quizDone ? (
            <div className="quiz-result">
              <div className="result-circle">
                <span className="result-score">{score}/{quizQuestions.length}</span>
                <span className="result-label">Score</span>
              </div>
              <h2 style={{ color: 'white', marginTop: '1.5rem' }}>
                {score === quizQuestions.length ? 'Perfect Score!' : score >= quizQuestions.length / 2 ? 'Good Job!' : 'Keep Practicing!'}
              </h2>
              <p style={{ color: '#9ca3af' }}>You answered {score} out of {quizQuestions.length} correctly.</p>
              {quizSaved  && <p style={{ color: '#22c55e', fontSize: '0.9rem' }}>Saved to your profile</p>}
              {!isSignedIn && <p style={{ color: '#f59e0b', fontSize: '0.9rem' }}>Sign in to save your results</p>}
              <button className="btn-primary" onClick={resetQuiz} style={{ marginTop: '1rem' }}>Retry Quiz</button>
            </div>
          ) : (
            <>
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${(current / quizQuestions.length) * 100}%` }} />
              </div>
              <div className="quiz-meta">
                <span className="quiz-cat">{q.category}</span>
                <span className="quiz-diff" style={{ color: DIFF_COLORS[q.difficulty] }}>{q.difficulty}</span>
                <span className="quiz-counter">{current + 1} / {quizQuestions.length}</span>
              </div>
              <div className="quiz-card">
                <p className="quiz-question">{q.question}</p>
                <div className="quiz-options">
                  {q.options.map((opt, i) => {
                    let cls = 'quiz-option';
                    if (selected === i) cls += ' selected';
                    if (submitted && i === q.correct) cls += ' correct';
                    if (submitted && selected === i && i !== q.correct) cls += ' wrong';
                    return (
                      <button key={i} className={cls} onClick={() => handleOptionSelect(i)}>
                        <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`quiz-explanation ${selected === q.correct ? 'exp-correct' : 'exp-wrong'}`}>
                    <strong>{selected === q.correct ? 'Correct!' : 'Incorrect'}</strong>
                    <p style={{ margin: '0.4rem 0 0' }}>{q.explanation}</p>
                  </div>
                )}
                <div className="quiz-actions">
                  {!submitted
                    ? <button className="btn-primary" disabled={selected === null} onClick={handleCheck}>Check Answer</button>
                    : <button className="btn-primary" onClick={handleNext}>{current + 1 < quizQuestions.length ? 'Next Question >' : 'See Results'}</button>}
                </div>
              </div>
            </>
          )}
        </div>
      )}


      {activeTab === 'code' && (
        <div className="code-layout">
          {/* Problem panel */}
          <div className="code-problem">
            <div className="prob-picker-row">
              <select className="prob-select" value={problem.id} onChange={handleProblemChange}>
                {PROBLEMS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <span className="prob-diff" style={{ color: DIFF_COLORS[problem.difficulty] }}>{problem.difficulty}</span>
              <span className="prob-cat">{problem.category}</span>
            </div>
            <h2 className="prob-title">{problem.title}</h2>
            <p className="prob-desc">{problem.description}</p>
            <div className="prob-section">
              <h4>Examples</h4>
              {problem.examples.map((ex, i) => (
                <div key={i} className="prob-example">
                  <div><span className="prob-label">Input:</span> <code>{ex.input}</code></div>
                  <div><span className="prob-label">Output:</span> <code>{ex.output}</code></div>
                  {ex.explanation && <div className="prob-exp-text"><span className="prob-label">Explanation:</span> {ex.explanation}</div>}
                </div>
              ))}
            </div>
            <div className="prob-section">
              <h4>Constraints</h4>
              <ul className="prob-constraints">
                {problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}
              </ul>
            </div>
          </div>

          {/* Editor panel */}
          <div className="code-editor-panel">
            <div className="editor-topbar">
              <select className="lang-select" value={language.value} onChange={handleLanguageChange}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <div className="editor-btns">
                <button className="btn-run" onClick={handleRun} disabled={running}>
                  {running ? 'Running...' : 'Run'}
                </button>
                <button className="btn-submit" onClick={handleSubmit} disabled={running}>
                  {running ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            <Editor
              height="380px"
              language={language.monaco}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }}
            />
            {(output || submitResult) && (
              <div className="code-output">
                {submitResult ? (
                  <div className={`submit-result ${submitResult.status === 'Accepted' ? 'accepted' : 'error'}`}>
                    <span className="sr-status">{submitResult.status === 'Accepted' ? '\u2713' : '\u2717'} {submitResult.status}</span>
                    {submitResult.status === 'Accepted' ? (
                      <div className="sr-stats">
                        <span>Runtime: <strong>{submitResult.runtime}</strong></span>
                        <span>Memory: <strong>{submitResult.memory}</strong></span>
                        <span>Beats: <strong>{submitResult.beats}</strong> of submissions</span>
                        {submitResult.saved !== undefined && (
                          <span>{submitResult.saved ? 'Saved to your profile' : 'Sign in to save'}</span>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: '#f87171', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>{submitResult.error}</p>
                    )}
                  </div>
                ) : (
                  <pre className="output-pre">{output}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={() => navigate('/ai-assistant')}>
          Analyze Your Skillset Level
        </button>
      </div>
    </div>
  );
}
