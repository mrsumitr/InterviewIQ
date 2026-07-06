import mongoose from 'mongoose';
import { ENV } from '../lib/env.js';
import { Problem } from '../models/Problem.js';

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: 'function twoSum(nums, target) {\n  // write your solution here\n}',
    functionName: 'twoSum',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
      // edge cases
      { input: [[2, 7], 9], expected: [0, 1] },
      { input: [[0, 4, 3, 0], 0], expected: [0, 3] },
      { input: [[-3, 4, 3, 90], 0], expected: [0, 2] },
      { input: [[1, 2, 3, 4, 6], 10], expected: [3, 4] },
      { input: [[100, 200, 300, 400, 500], 900], expected: [3, 4] },
    ],
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    description:
      'Write a function that reverses a string. The input string is given as an array of characters. Do not allocate extra space for another array; modify the input array in-place.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
    ],
    constraints: ['1 <= s.length <= 10^5'],
    starterCode: 'function reverseString(s) {\n  // write your solution here\n}',
    functionName: 'reverseString',
    testCases: [
      { input: [['h', 'e', 'l', 'l', 'o']], expected: ['o', 'l', 'l', 'e', 'h'] },
      { input: [['H', 'a', 'n', 'n', 'a', 'h']], expected: ['h', 'a', 'n', 'n', 'a', 'H'] },
      // edge cases
      { input: [['a']], expected: ['a'] },
      { input: [['a', 'b']], expected: ['b', 'a'] },
      { input: [['r', 'a', 'c', 'e', 'c', 'a', 'r']], expected: ['r', 'a', 'c', 'e', 'c', 'a', 'r'] },
      { input: [['1', '2', '3', '4']], expected: ['4', '3', '2', '1'] },
      { input: [['A', 'b', 'C', 'd']], expected: ['d', 'C', 'b', 'A'] },
    ],
  },
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Medium',
    tags: ['String', 'Two Pointers'],
    description:
      'Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5'],
    starterCode: 'function isPalindrome(s) {\n  // write your solution here\n}',
    functionName: 'isPalindrome',
    testCases: [
      { input: ['A man, a plan, a canal: Panama'], expected: true },
      { input: ['race a car'], expected: false },
      { input: [' '], expected: true },
      // edge cases
      { input: [''], expected: true },
      { input: ['a.'], expected: true },
      { input: ['0P'], expected: false },
      { input: ['Was it a car or a cat I saw?'], expected: true },
      { input: ['No lemon, no melon'], expected: true },
    ],
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    description:
      'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6.' },
    ],
    constraints: ['1 <= nums.length <= 10^5'],
    starterCode: 'function maxSubArray(nums) {\n  // write your solution here\n}',
    functionName: 'maxSubArray',
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1]], expected: 1 },
      { input: [[5, 4, -1, 7, 8]], expected: 23 },
      // edge cases
      { input: [[-2, -3, -1, -5]], expected: -1 },
      { input: [[-100, 1, 2, 3]], expected: 6 },
      { input: [[-1, 2, -1, 2, -1]], expected: 3 },
      { input: [[3, 3, 3, 3]], expected: 12 },
      { input: [[4, 3, 2, 1]], expected: 10 },
    ],
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    description:
      'You are given an integer array height. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' },
    ],
    constraints: ['2 <= height.length <= 10^5'],
    starterCode: 'function maxArea(height) {\n  // write your solution here\n}',
    functionName: 'maxArea',
    testCases: [
      { input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { input: [[1, 1]], expected: 1 },
      { input: [[4, 3, 2, 1, 4]], expected: 16 },
      // edge cases
      { input: [[3, 3, 3, 3]], expected: 9 },
      { input: [[5, 4, 3, 2, 1]], expected: 6 },
      { input: [[1, 2, 3, 4, 5]], expected: 6 },
      { input: [[10, 1, 1, 1, 10]], expected: 40 },
      { input: [[1, 100, 1]], expected: 2 },
    ],
  },
];

const seed = async () => {
  await mongoose.connect(ENV.DB_URL);
  console.log('Connected to MongoDB');

  for (const problem of problems) {
    await Problem.findOneAndUpdate({ slug: problem.slug }, problem, { upsert: true });
  }

  console.log(`Seeded ${problems.length} problems`);
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
