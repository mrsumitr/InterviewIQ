'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
}

interface Interview {
  _id: string;
  title: string;
  roomId: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  scheduledAt: string;
  interviewers: { _id: string; name: string }[];
  interviewee: { _id: string; name: string };
  problem?: { title: string };
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [intervieweeEmail, setIntervieweeEmail] = useState('');
  const [problemId, setProblemId] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchInterviews = () => {
    api.get('/interviews').then((res) => {
      setInterviews(res.data.interviews);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInterviews();
    api.get('/problems').then((res) => setProblems(res.data.problems));
  }, []);

  const liveSessions = interviews.filter((i) => i.status === 'ongoing' || i.status === 'scheduled');
  const pastSessions = interviews.filter((i) => i.status === 'completed');

  const handleCreateSession = async () => {
    setError('');
    setCreating(true);
    try {
      const userRes = await api.get(`/auth/users/lookup?email=${encodeURIComponent(intervieweeEmail)}`);
      const interviewee = userRes.data.user;

      await api.post('/interviews', {
        title,
        intervieweeId: interviewee._id ?? interviewee.id,
        problemId: problemId || undefined,
        scheduledAt: new Date().toISOString(),
      });

      setOpen(false);
      setTitle('');
      setIntervieweeEmail('');
      setProblemId('');
      fetchInterviews();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { msg?: string } } }).response?.data?.msg
          : undefined;
      setError(message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground mt-1">Ready to level up your coding skills?</p>
          </div>
          {user?.role === 'interviewer' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button>+ Create Session</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title">Session Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frontend Round 1" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="intervieweeEmail">Interviewee Email</Label>
                    <Input
                      id="intervieweeEmail"
                      type="email"
                      value={intervieweeEmail}
                      onChange={(e) => setIntervieweeEmail(e.target.value)}
                      placeholder="candidate@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Select Problem</Label>
                    <Select value={problemId} onValueChange={(value) => value && setProblemId(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a problem" />
                      </SelectTrigger>
                      <SelectContent>
                        {problems.map((p) => (
                          <SelectItem key={p._id} value={p._id}>{p.title} ({p.difficulty})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateSession} disabled={creating || !title || !intervieweeEmail} className="w-full">
                    {creating ? 'Creating...' : 'Create Room'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <Card className="p-5">
            <p className="text-2xl font-bold text-emerald-400">{liveSessions.length}</p>
            <p className="text-sm text-muted-foreground">Active Sessions</p>
          </Card>
          <Card className="p-5">
            <p className="text-2xl font-bold text-emerald-400">{interviews.length}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold flex items-center gap-2">
            Sessions {liveSessions.length > 0 && <Badge className="bg-emerald-400 text-zinc-950">{liveSessions.length}</Badge>}
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {liveSessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No live sessions right now.</p>
            )}
            {liveSessions.map((interview) => (
              <Card key={interview._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{interview.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Host: {interview.interviewers[0]?.name} · {interview.problem?.title || 'No problem selected'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {interview.status === 'ongoing' && <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/30">Live</Badge>}
                  {interview.status === 'scheduled' && <Badge variant="outline">Scheduled</Badge>}
                  <Button size="sm" onClick={() => router.push(`/room/${interview.roomId}`)}>
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold">Your Past Sessions</h2>
          <div className="mt-3 flex flex-col gap-2">
            {!loading && pastSessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No past sessions yet.</p>
            )}
            {pastSessions.map((interview) => (
              <Card key={interview._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{interview.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {interview.problem?.title || 'No problem'} · {new Date(interview.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
