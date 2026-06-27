import { Problem } from '../models/Problem.js';

export const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select('title slug difficulty tags').sort({ createdAt: 1 });
    res.status(200).json({ problems });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

export const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });

    res.status(200).json({ problem });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};
