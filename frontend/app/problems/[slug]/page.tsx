'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  starterCode: string;
}

const difficultyColor: Record<Problem['difficulty'], string> = {
  Easy: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  Hard: 'bg-red-400/10 text-red-400 border-red-400/30',
};

function ProblemDetail() {
  const { slug } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    api.get(`/problems/${slug}`).then((res) => {
      setProblem(res.data.problem);
      setCode(res.data.problem.starterCode);
    });
  }, [slug]);

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

  if (!problem) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      <div className="p-6 overflow-y-auto border-r border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{problem.title}</h1>
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
      </div>

      <div className="flex flex-col">
        <div className="flex-1 min-h-[400px]">
          <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>
        <div className="border-t border-border p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Output</span>
          <Button size="sm" onClick={runCode}>Run Code</Button>
        </div>
        <pre className="px-3 pb-3 text-sm font-mono text-muted-foreground whitespace-pre-wrap min-h-[60px]">
          {output}
        </pre>
      </div>
    </div>
  );
}

export default function ProblemDetailPage() {
  return (
    <ProtectedRoute>
      <ProblemDetail />
    </ProtectedRoute>
  );
}
