import Link from 'next/link';
import {
  Zap,
  Check,
  Play,
  ArrowRight,
  Video,
  Code2,
  Users,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 bg-zinc-950 text-zinc-50">
      <nav className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 sm:px-10 py-5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-emerald-400 flex items-center justify-center">
              <Zap className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="font-semibold tracking-tight">InterviewIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors hidden sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 rounded-md bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-300 transition-colors"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-6 sm:px-10 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <Zap className="h-3 w-3" /> Real-time Interviews
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
            Interview Together,
            <br />
            Hire with Confidence
          </h1>

          <p className="mt-5 text-zinc-400 text-base sm:text-lg max-w-md">
            The ultimate platform for live video interviews. Connect face-to-face,
            track candidates, and make better hiring decisions.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {['Live Video Call', 'Interview Scheduling', 'Multi-Interviewer'].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300"
              >
                <Check className="h-3 w-3 text-emerald-400" /> {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-300 transition-colors"
            >
              Start Interviewing <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition-colors">
              <Play className="h-4 w-4" /> Watch Demo
            </button>
          </div>

          <div className="mt-10 flex gap-8">
            <div>
              <p className="text-2xl font-bold text-emerald-400">25+</p>
              <p className="text-xs text-zinc-500">Concurrent Rooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">2</p>
              <p className="text-xs text-zinc-500">Min Setup Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">99.9%</p>
              <p className="text-xs text-zinc-500">Uptime</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
            <div className="flex items-center gap-1.5 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="aspect-video rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <Video className="h-7 w-7 text-emerald-400" />
              </div>
              <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center">
                <Users className="h-7 w-7 text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="absolute -top-6 -right-4 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium shadow-lg flex items-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-400" /> Coding Round
          </div>
          <div className="absolute -bottom-6 -left-4 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium shadow-lg flex items-center gap-2">
            <Video className="h-4 w-4 text-emerald-400" /> HD Video
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 py-16 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything You Need to <span className="text-emerald-400">Succeed</span>
          </h2>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
            Built for interviewers and candidates who need a seamless, reliable interview experience.
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: Video,
                title: 'HD Video Calls',
                desc: 'Crystal clear video and audio for seamless interviews, powered by LiveKit.',
              },
              {
                icon: Code2,
                title: 'Role-based Access',
                desc: 'Interviewers and interviewees get permissions tailored to their role.',
              },
              {
                icon: Users,
                title: 'Panel Interviews',
                desc: 'Add multiple interviewers to a single session for collaborative hiring.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-400/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
