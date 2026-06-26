import crypto from 'crypto';
import { RoomServiceClient } from 'livekit-server-sdk';
import { Interview } from '../models/Interview.js';
import { ENV } from '../lib/env.js';

const roomService = new RoomServiceClient(ENV.LIVEKIT_URL, ENV.LIVEKIT_API_KEY, ENV.LIVEKIT_API_SECRET);

export const createInterview = async (req, res) => {
  try {
    const { title, intervieweeId, interviewerIds, scheduledAt } = req.body;

    if (!title || !intervieweeId || !scheduledAt)
      return res.status(400).json({ msg: 'title, intervieweeId and scheduledAt are required' });

    const interviewers = new Set([req.userId, ...(interviewerIds || [])]);

    const interview = await Interview.create({
      title,
      interviewers: [...interviewers],
      interviewee: intervieweeId,
      scheduledAt,
      roomId: crypto.randomUUID(),
    });

    res.status(201).json({ msg: 'Interview scheduled', interview });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      $or: [{ interviewers: req.userId }, { interviewee: req.userId }],
    })
      .populate('interviewers', 'name email')
      .populate('interviewee', 'name email')
      .sort({ scheduledAt: -1 });

    res.status(200).json({ interviews });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

export const startInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ roomId: req.params.roomId });
    if (!interview) return res.status(404).json({ msg: 'Interview not found' });

    if (interview.status === 'scheduled') {
      interview.status = 'ongoing';
      interview.startedAt = new Date();
      await interview.save();
    }

    res.status(200).json({ interview });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

export const endInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ roomId: req.params.roomId });
    if (!interview) return res.status(404).json({ msg: 'Interview not found' });

    const isInterviewer = interview.interviewers.some((id) => id.toString() === req.userId);
    if (!isInterviewer)
      return res.status(403).json({ msg: 'Only an interviewer can end the interview' });

    interview.status = 'completed';
    interview.endedAt = new Date();
    await interview.save();

    try {
      await roomService.deleteRoom(interview.roomId);
    } catch {
      // room may already be empty/closed, ignore
    }

    res.status(200).json({ interview });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};
