'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoCall from '@/components/VideoCall';
import { useAuth } from '@/context/AuthContext';

export default function RoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchToken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livekit/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ roomName: roomId, role: user?.role }),
        });

        const data = await res.json();
        if (!res.ok) return setError(data.msg);

        setToken(data.token);
        setUrl(data.url);
      } catch {
        setError('Failed to connect to server');
      }
    };

    fetchToken();
  }, [roomId, user]);

  if (error) return <div>{error}</div>;
  if (!token || !url) return <div>Connecting...</div>;

  return (
    <VideoCall
      token={token}
      url={url}
      onDisconnect={() => router.push('/')}
    />
  );
}
