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

interface TestCase {
  input: unknown[];
  expected: unknown;
}

interface Problem {
  title: string;
  difficulty: string;
  tags: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  starterCode: string;
  functionName?: string;
  testCases?: TestCase[];
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
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<{ index: number; status: string; detail: string }[]>([]);
  const [testSummary, setTestSummary] = useState<{ passed: number; total: number } | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);

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

  const runCode = async () => {
    setTestResults([]);
    setTestSummary(null);
    setRawOutput(null);

    if (!interview) return;

    if (language === 'javascript') {
      const testCases = interview.problem?.testCases;
      const functionName = interview.problem?.functionName;

      if (!testCases?.length || !functionName) {
        setTestResults([{ index: 0, status: 'error', detail: 'No test cases available for this problem.' }]);
        return;
      }

      try {
        const fn = new Function(`${code}\n return typeof ${functionName} !== 'undefined' ? ${functionName} : null;`)() as ((...args: unknown[]) => unknown) | null;
        if (!fn) {
          setTestResults([{ index: 0, status: 'error', detail: `Function '${functionName}' not found. Make sure you define it.` }]);
          return;
        }

        const results: { index: number; status: string; detail: string }[] = [];
        let passed = 0;

        testCases.forEach((tc, i) => {
          try {
            const args = JSON.parse(JSON.stringify(tc.input)) as unknown[];
            const result = fn(...args);
            const check = (result === undefined || result === null) ? args[0] : result;
            const ok = JSON.stringify(check) === JSON.stringify(tc.expected);
            if (ok) {
              passed++;
              results.push({ index: i, status: 'pass', detail: '' });
            } else {
              results.push({ index: i, status: 'fail', detail: `expected ${JSON.stringify(tc.expected)} got ${JSON.stringify(check)}` });
            }
          } catch (e) {
            results.push({ index: i, status: 'error', detail: e instanceof Error ? e.message : 'Runtime error' });
          }
        });

        setTestResults(results);
        setTestSummary({ passed, total: testCases.length });
      } catch (err) {
        setTestResults([{ index: 0, status: 'error', detail: err instanceof Error ? err.message : 'Syntax error' }]);
      }
    } else {
      setRunning(true);
      try {
        const res = await api.post('/execute', { roomId, code, language });
        setRawOutput(res.data.output || 'No output.');
      } catch (err) {
        setRawOutput(err instanceof Error ? err.message : 'Execution failed.');
      } finally {
        setRunning(false);
      }
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

  const getAIFeedback = async () => {
    if (!code.trim()) return;
    setAiFeedback(null);
    setAiFeedbackLoading(true);
    try {
      const res = await api.post('/ai/feedback', {
        code,
        language,
        problemTitle: interview?.problem?.title,
        problemDescription: interview?.problem?.description,
      });
      setAiFeedback(res.data.feedback);
    } catch {
      setAiFeedback('Failed to get AI feedback. Please try again.');
    } finally {
      setAiFeedbackLoading(false);
    }
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
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          <div className="border-t border-border p-3 flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground shrink-0">
              {testSummary
                ? `${testSummary.passed}/${testSummary.total} passed`
                : language !== 'javascript' ? 'Output' : 'Test Results'}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={language}
                onChange={(e) => { setLanguage(e.target.value); setTestResults([]); setTestSummary(null); setRawOutput(null); }}
                className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <Button size="sm" onClick={runCode} disabled={running}>
                {running ? 'Running...' : 'Run Code'}
              </Button>
              <Button size="sm" variant="outline" onClick={getAIFeedback} disabled={aiFeedbackLoading || !code.trim()}>
                {aiFeedbackLoading ? 'Analyzing...' : 'AI Review'}
              </Button>
            </div>
          </div>
          <div className="px-3 pb-3 flex flex-col gap-1 min-h-15 max-h-30 overflow-y-auto">
            {rawOutput !== null && (
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{rawOutput}</pre>
            )}
            {rawOutput === null && testResults.length === 0 && !running && (
              <p className="text-xs text-muted-foreground mt-1">Click Run Code to test your solution.</p>
            )}
            {running && (
              <p className="text-xs text-muted-foreground mt-1">Executing...</p>
            )}
            {testResults.map((r) => (
              <div key={r.index} className={`flex items-start gap-2 text-xs rounded px-2 py-1 ${
                r.status === 'pass' ? 'bg-emerald-400/10 text-emerald-400' :
                r.status === 'fail' ? 'bg-red-400/10 text-red-400' :
                'bg-amber-400/10 text-amber-400'
              }`}>
                <span className="shrink-0 font-medium">
                  {r.status === 'pass' ? '✓' : r.status === 'fail' ? '✗' : '!'} Test {r.index + 1}
                </span>
                {r.detail && <span className="font-mono truncate">{r.detail}</span>}
              </div>
            ))}
            {aiFeedbackLoading && (
              <p className="text-xs text-muted-foreground mt-1 italic">AI is reviewing your code...</p>
            )}
            {aiFeedback && (
              <div className="mt-2 rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3">
                <p className="text-xs font-semibold text-emerald-400 mb-1.5">AI Code Review</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{aiFeedback}</pre>
              </div>
            )}
          </div>
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
