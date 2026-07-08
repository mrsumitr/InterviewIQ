import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../lib/env.js';

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export const getAIFeedback = async (req, res) => {
  try {
    const { code, language, problemTitle, problemDescription } = req.body;

    if (!code) return res.status(400).json({ msg: 'Code is required' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a senior software engineer reviewing code from a technical interview.

Problem: ${problemTitle || 'Unknown'}
${problemDescription ? `Description: ${problemDescription}` : ''}
Language: ${language || 'javascript'}

Candidate's Code:
\`\`\`${language || 'javascript'}
${code}
\`\`\`

Provide a concise code review with exactly these sections:
1. **Correctness** – Does the approach look correct? Any logical issues?
2. **Time Complexity** – What is the Big-O time complexity? Is it optimal?
3. **Space Complexity** – What is the Big-O space complexity?
4. **Code Quality** – Readability, naming, and style observations.
5. **Top Suggestion** – One specific, actionable improvement.

Keep each section to 1-2 sentences. Be direct and constructive. Do not add any intro or outro text.`;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    if (req.body.roomId) {
      const { Interview } = await import('../models/Interview.js');
      await Interview.findOneAndUpdate({ roomId: req.body.roomId }, { aiFeedback: feedback });
    }

    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ msg: 'AI feedback failed', error: error.message });
  }
};
