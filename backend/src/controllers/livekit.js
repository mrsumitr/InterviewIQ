import { AccessToken } from 'livekit-server-sdk';
import { ENV } from '../lib/env.js';

export const generateToken = async (req, res) => {
  try {
    const { roomName, role } = req.body;
    const participantName = req.userId;

    if (!roomName || !role)
      return res.status(400).json({ msg: 'roomName and role are required' });

    const token = new AccessToken(ENV.LIVEKIT_API_KEY, ENV.LIVEKIT_API_SECRET, {
      identity: participantName,
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
