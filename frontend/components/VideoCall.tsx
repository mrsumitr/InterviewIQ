'use client';

import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  ControlBar,
  RoomAudioRenderer,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

interface VideoCallProps {
  token: string;
  url: string;
  onDisconnect: () => void;
  isInterviewer: boolean;
  onEndInterview: () => void;
}

function CompactConference() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  return (
    <GridLayout tracks={tracks} className="h-full w-full">
      <ParticipantTile />
    </GridLayout>
  );
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
      className="relative h-full w-full flex flex-col"
    >
      <div className="flex-1 min-h-0">
        <CompactConference />
      </div>
      <ControlBar variation="minimal" controls={{ screenShare: false, chat: false }} />
      <RoomAudioRenderer />
      {isInterviewer && (
        <button
          onClick={onEndInterview}
          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2.5 py-1 rounded z-50"
        >
          End Interview
        </button>
      )}
    </LiveKitRoom>
  );
}
