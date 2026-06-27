'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex flex-col">
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <header className="relative z-10 px-6 sm:px-10 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-emerald-400 flex items-center justify-center">
            <Zap className="h-4 w-4 text-zinc-950" />
          </div>
          <span className="font-semibold tracking-tight">InterviewIQ</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                No account?{' '}
                <Link href="/register" className="underline text-foreground">
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="relative z-10 px-6 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} InterviewIQ. All rights reserved.
      </footer>
    </div>
  );
}
