import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-slate-900 overflow-hidden flex-col justify-between p-12">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">IC</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">ICON</div>
              <div className="text-slate-400 text-xs font-medium tracking-widest uppercase">Services</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-[1.15]">
              Managing projects<br />
              <span className="text-indigo-400">at scale</span>, simplified.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Track every domain, task, and subtask across your entire project portfolio — from civil works to electrical installations — in one unified platform.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Civil Works', 'Electrical', 'Plumbing', 'Project Tracking', 'Client Portal'].map((tag) => (
              <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/8 text-slate-300 border border-white/10">
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { value: '3+', label: 'Active Projects' },
              { value: '4', label: 'User Roles' },
              { value: '100%', label: 'Visibility' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-600">
          © 2026 ICON SERVICES. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold">IC</span>
            </div>
            <span className="font-bold text-foreground">ICON Services</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your workspace to continue.
            </p>
          </div>

          <LoginForm />

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wide">
              Demo Credentials
            </p>
            <div className="space-y-1.5">
              {[
                { role: 'Admin', email: 'admin@iconservices.com' },
                { role: 'Manager', email: 'manager@iconservices.com' },
                { role: 'Employee', email: 'usman@iconservices.com' },
                { role: 'Client', email: 'client@alphaconstruction.com' },
              ].map((cred) => (
                <div key={cred.role} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground/70">{cred.role}</span>
                  <span className="font-mono text-muted-foreground">{cred.email}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground/70 pt-1 border-t border-border/50 mt-2">
                Password: <span className="font-mono">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
