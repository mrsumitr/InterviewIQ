'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Zap, Send } from 'lucide-react';
import VideoCall from '@/components/VideoCall';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const difficultyColor: Record<string, string> = {
  Easy: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  Hard: 'bg-red-400/10 text-red-400 border-red-400/30',
};

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  title: string;
  difficulty: string;
  tags: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  starterCode: string;
}

interface InterviewData {
  title: string;
  status: string;
  problem: Problem | null;
  code: string;
  interviewers: { _id: string; name: string }[];
  interviewee: { _id: string; name: string };
}

interface ChatMessage {
  sender: string;
  message: string;
  sentAt: string;
  self?: boolean;
}

function Room() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const skipNextEmit = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    api.get(`/interviews/${roomId}`).then((res) => {
      const data: InterviewData = res.data.interview;
      setInterview(data);
      setCode(data.code || data.problem?.starterCode || '');
    });

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

        await api.patch(`/interviews/${roomId}/start`);
      } catch {
        setError('Failed to connect to server');
      }
    };

    fetchToken();
  }, [roomId, user]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.connect();
    socket.emit('join-room', roomId);

    socket.on('code-change', ({ code: incoming }: { code: string }) => {
      skipNextEmit.current = true;
      setCode(incoming);
    });

    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('code-change');
      socket.off('chat-message');
      socket.disconnect();
    };
  }, [roomId, user]);

  const handleCodeChange = (value: string | undefined) => {
    const next = value || '';
    setCode(next);

    if (skipNextEmit.current) {
      skipNextEmit.current = false;
      return;
    }

    getSocket().emit('code-change', { roomId, code: next });

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      api.patch(`/interviews/${roomId}/code`, { code: next });
    }, 1500);
  };

  const runCode = () => {
    const logs: string[] = [];
    const customConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(' ')) };
    try {
      const fn = new Function('console', code);
      fn(customConsole);
      setOutput(logs.length ? logs.join('\n') : 'Code ran with no output.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Runtime error';
      setOutput(`Error: ${message}`);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      sender: user?.name || 'You',
      message: chatInput,
      sentAt: new Date().toISOString(),
      self: true,
    };
    setMessages((prev) => [...prev, msg]);
    getSocket().emit('chat-message', { roomId, message: chatInput, sender: user?.name });
    setChatInput('');
  };

  const handleDisconnect = () => {
    router.push('/dashboard');
  };

  const handleEndInterview = async () => {
    try {
      await api.patch(`/interviews/${roomId}/end`);
    } finally {
      router.push('/dashboard');
    }
  };

  if (error) return <div className="min-h-screen bg-background flex items-center justify-center text-destructive">{error}</div>;
  if (!token || !url || !interview) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Connecting...</div>;
  }

  const problem = interview.problem;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-emerald-400 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-zinc-950" />
          </div>
          <span className="font-semibold text-sm tracking-tight">InterviewIQ</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/problems" className="text-sm text-muted-foreground hover:text-foreground">Problems</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr_320px] overflow-hidden">
        <div className="overflow-y-auto border-r border-border p-5 hidden lg:block">
          {problem ? (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{problem.title}</h1>
                <Badge variant="outline" className={difficultyColor[problem.difficulty]}>
                  {problem.difficulty}
                </Badge>
              </div>
              <div className="mt-2 flex gap-1.5">
                {problem.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{problem.description}</p>

              <h3 className="mt-6 font-medium text-sm">Examples</h3>
              {problem.examples.map((ex, i) => (
                <div key={i} className="mt-2 rounded-lg bg-muted p-3 text-sm">
                  <p><span className="text-muted-foreground">Input:</span> {ex.input}</p>
                  <p><span className="text-muted-foreground">Output:</span> {ex.output}</p>
                  {ex.explanation && <p className="text-muted-foreground mt-1">{ex.explanation}</p>}
                </div>
              ))}

              <h3 className="mt-6 font-medium text-sm">Constraints</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No problem selected for this session.</p>
          )}
        </div>

        <div className="flex flex-col border-r border-border">
          <div className="flex-1 min-h-[300px]">
            <MonacoEditor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          <div className="border-t border-border p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Output</span>
            <Button size="sm" onClick={runCode}>Run Code</Button>
          </div>
          <pre className="px-3 pb-3 text-sm font-mono text-muted-foreground whitespace-pre-wrap min-h-[60px] max-h-[120px] overflow-y-auto">
            {output}
          </pre>
        </div>

        <div className="flex flex-col">
          <div className="h-72 shrink-0">
            <VideoCall
              token={token}
              url={url}
              onDisconnect={handleDisconnect}
              isInterviewer={user?.role === 'interviewer'}
              onEndInterview={handleEndInterview}
            />
          </div>
          <div className="flex-1 flex flex-col border-t border-border overflow-hidden">
            <div className="px-3 py-2 text-sm font-medium border-b border-border">Session Chat</div>
            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.self ? 'text-right' : ''}`}>
                  <p className="text-xs text-muted-foreground">{m.sender}</p>
                  <p className="inline-block rounded-lg bg-muted px-2.5 py-1.5 mt-0.5">{m.message}</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-border flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  return (
    <ProtectedRoute>
      <Room />
    </ProtectedRoute>
  );
}
