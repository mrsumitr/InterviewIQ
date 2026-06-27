import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  tags: [{ type: String }],
  description: {
    type: String,
    required: true,
  },
  examples: [exampleSchema],
  constraints: [{ type: String }],
  starterCode: {
    type: String,
    default: 'function solve() {\n  // write your solution here\n}',
  },
}, { timestamps: true });

export const Problem = mongoose.model('Problem', problemSchema);
