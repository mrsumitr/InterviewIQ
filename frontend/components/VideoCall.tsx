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
  isInterviewer: boolean;
  onEndInterview: () => void;
}

export default function VideoCall({
  token,
  url,
  onDisconnect,
  isInterviewer,
  onEndInterview,
}: VideoCallProps) {
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
      {isInterviewer && (
        <button
          onClick={onEndInterview}
          className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-50"
        >
          End Interview
        </button>
      )}
    </LiveKitRoom>
  );
}
