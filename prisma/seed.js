const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const questions = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    examples: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    hints: "Try using a hash map for O(n) time.",
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    topic: "Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: "Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
    hints: "Use three pointers: prev, curr, next.",
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: "Input: s = '()[]{}'\nOutput: true",
    hints: "Use a stack to match opening and closing brackets.",
  },
  {
    title: "Binary Search",
    difficulty: "Easy",
    topic: "Binary Search",
    description: "Given a sorted array of integers and a target value, return the index if found. If not, return -1.",
    examples: "Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4",
    hints: "Compare target with mid element and narrow the search space.",
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Arrays",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    examples: "Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6 (subarray [4,-1,2,1])",
    hints: "Kadane's Algorithm — track current sum and max sum.",
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topic: "Linked List",
    description: "Merge two sorted linked lists and return it as a sorted list.",
    examples: "Input: l1 = [1,2,4], l2 = [1,3,4]\nOutput: [1,1,2,3,4,4]",
    hints: "Use a dummy node and compare heads.",
  },
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
    examples: "Input: n = 3\nOutput: 3",
    hints: "This is a Fibonacci-like problem.",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: "Input: s = 'abcabcbb'\nOutput: 3",
    hints: "Use a sliding window with a Set.",
  },
  {
    title: "Detect Cycle in Linked List",
    difficulty: "Easy",
    topic: "Linked List",
    description: "Given head of a linked list, determine if the linked list has a cycle in it.",
    examples: "Input: head = [3,2,0,-4] (cycle at pos 1)\nOutput: true",
    hints: "Floyd's Tortoise and Hare algorithm.",
  },
  {
    title: "LRU Cache",
    difficulty: "Hard",
    topic: "Design",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    examples: "LRUCache(2) → put(1,1) → put(2,2) → get(1) returns 1 → put(3,3) → get(2) returns -1",
    hints: "Use a HashMap + Doubly Linked List.",
  },
];

async function main() {
  const existing = await prisma.question.count();
  if (existing > 0) {
    console.log(`Already seeded (${existing} questions). Skipping.`);
    return;
  }
  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log(`Seeded ${questions.length} questions.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
