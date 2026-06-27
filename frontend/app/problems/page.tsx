'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

const difficultyColor: Record<Problem['difficulty'], string> = {
  Easy: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  Hard: 'bg-red-400/10 text-red-400 border-red-400/30',
};

function ProblemsList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/problems').then((res) => {
      setProblems(res.data.problems);
      setLoading(false);
    });
  }, []);

  const counts = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === 'Easy').length,
    medium: problems.filter((p) => p.difficulty === 'Medium').length,
    hard: problems.filter((p) => p.difficulty === 'Hard').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Practice Problems</h1>
        <p className="mt-2 text-muted-foreground">
          Sharpen your coding skills with these curated problems.
        </p>

        <div className="mt-6 flex gap-6 text-sm">
          <span><span className="font-semibold text-foreground">{counts.total}</span> <span className="text-muted-foreground">Total</span></span>
          <span><span className="font-semibold text-emerald-400">{counts.easy}</span> <span className="text-muted-foreground">Easy</span></span>
          <span><span className="font-semibold text-amber-400">{counts.medium}</span> <span className="text-muted-foreground">Medium</span></span>
          <span><span className="font-semibold text-red-400">{counts.hard}</span> <span className="text-muted-foreground">Hard</span></span>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {loading && <p className="text-muted-foreground">Loading problems...</p>}
          {problems.map((problem) => (
            <Link key={problem._id} href={`/problems/${problem.slug}`}>
              <Card className="p-4 hover:border-emerald-400/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{problem.title}</p>
                    <div className="mt-1.5 flex gap-1.5">
                      {problem.tags.map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline" className={difficultyColor[problem.difficulty]}>
                    {problem.difficulty}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <ProtectedRoute>
      <ProblemsList />
    </ProtectedRoute>
  );
}
