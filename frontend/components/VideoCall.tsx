'use client';

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

interface VideoCallProps {
  token: string;
  url: string;
  onDisconnect: () => void;
}

export default function VideoCall({ token, url, onDisconnect }: VideoCallProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      connect={true}
      video={true}
      audio={true}
      onDisconnected={onDisconnect}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
