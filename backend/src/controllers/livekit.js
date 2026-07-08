import { AccessToken } from 'livekit-server-sdk';
import { ENV } from '../lib/env.js';
import { Interview } from '../models/Interview.js';
import { User } from '../models/User.js';

export const generateToken = async (req, res) => {
  try {
    const { roomName, role } = req.body;
    const participantName = req.userId;

    if (!roomName || !role)
      return res.status(400).json({ msg: 'roomName and role are required' });

    const interview = await Interview.findOne({ roomId: roomName });
    if (!interview) return res.status(404).json({ msg: 'Interview room not found' });

    const isParticipant =
      interview.interviewers.some((id) => id.toString() === participantName) ||
      interview.interviewee.toString() === participantName;

    if (!isParticipant)
      return res.status(403).json({ msg: 'You are not part of this interview' });

    if (interview.status === 'completed')
      return res.status(403).json({ msg: 'This session has already ended.' });

    const isInterviewer = interview.interviewers.some((id) => id.toString() === participantName);
    if (interview.isLocked && !isInterviewer)
      return res.status(403).json({ msg: 'This session is locked. You cannot join right now.' });

    const user = await User.findById(participantName).select('name');

    const token = new AccessToken(ENV.LIVEKIT_API_KEY, ENV.LIVEKIT_API_SECRET, {
      identity: participantName,
      name: user?.name || 'Participant',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: role === 'interviewer',
    });

    const jwt = await token.toJwt();
    res.status(200).json({ token: jwt, url: ENV.LIVEKIT_URL });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};
