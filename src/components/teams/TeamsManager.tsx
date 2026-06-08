'use client';

import { useState } from 'react';
import { Plus, Users, Pencil, Trash2, Loader2, UserPlus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, getInitials, ROLE_CONFIG } from '@/lib/utils';
import type { Role } from '@/types';

interface Employee { id: string; name: string; email: string; role: string; }
interface TeamMemberEntry { user: Employee; }
interface Team { id: string; name: string; description?: string | null; members: TeamMemberEntry[]; }

interface FormState { name: string; description: string; memberIds: string[]; }
const EMPTY: FormState = { name: '', description: '', memberIds: [] };

function MemberPicker({
  allEmployees, selected, onChange,
}: { allEmployees: Employee[]; selected: string[]; onChange: (ids: string[]) => void }) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }
  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
      {allEmployees.map((emp) => {
        const active = selected.includes(emp.id);
        const roleCfg = ROLE_CONFIG[emp.role as Role];
        return (
          <button
            key={emp.id}
            type="button"
            onClick={() => toggle(emp.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all',
              active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            )}
          >
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {getInitials(emp.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
              <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
            </div>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md flex-shrink-0', roleCfg?.color)}>
              {roleCfg?.label}
            </span>
            {active && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
          </button>
        );
      })}
      {allEmployees.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No employees found.</p>
      )}
    </div>
  );
}

function TeamForm({
  initial, allEmployees, isLoading, error, onSubmit, onCancel, submitLabel,
}: {
  initial: FormState; allEmployees: Employee[]; isLoading: boolean; error: string;
  onSubmit: (d: FormState) => void; onCancel: () => void; submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Team Name *</Label>
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Civil & Structural" />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="What does this team handle?" rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          <UserPlus className="h-3.5 w-3.5" />
          Members ({form.memberIds.length} selected)
        </Label>
        <MemberPicker allEmployees={allEmployees} selected={form.memberIds} onChange={(ids) => setForm((p) => ({ ...p, memberIds: ids }))} />
      </div>
      {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>Cancel</Button>
        <Button onClick={() => onSubmit(form)} disabled={isLoading || !form.name.trim()} className="flex-1">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : submitLabel}
        </Button>
      </div>
    </div>
  );
}

export function TeamsManager({ initialTeams, allEmployees, isAdmin }: { initialTeams: Team[]; allEmployees: Employee[]; isAdmin: boolean }) {
  const [teams, setTeams] = useState(initialTeams);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(form: FormState) {
    setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const team = await res.json();
      setTeams((prev) => [...prev, team].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAdd(false);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }

  async function handleEdit(form: FormState) {
    if (!editTarget) return;
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`/api/teams/${editTarget.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditTarget(null);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`/api/teams/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      setTeams((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{teams.length} teams</p>
        <Button size="sm" onClick={() => { setError(''); setShowAdd(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="group hover:shadow-md hover:border-primary/30 transition-all duration-150">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{team.name}</h3>
                    <p className="text-xs text-muted-foreground">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground"
                    onClick={() => { setError(''); setEditTarget(team); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive"
                      onClick={() => { setError(''); setDeleteTarget(team); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {team.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{team.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {team.members.slice(0, 6).map(({ user }) => (
                  <div key={user.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] text-foreground/80 font-medium">{user.name.split(' ')[0]}</span>
                  </div>
                ))}
                {team.members.length > 6 && (
                  <div className="flex items-center px-2 py-1 rounded-full bg-muted text-[11px] text-muted-foreground">
                    +{team.members.length - 6} more
                  </div>
                )}
                {team.members.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No members yet</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Users className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No teams yet. Create your first internal team.</p>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={(v) => { setShowAdd(v); setError(''); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />New Team</DialogTitle></DialogHeader>
          <TeamForm initial={EMPTY} allEmployees={allEmployees} isLoading={isLoading} error={error} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} submitLabel="Create Team" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); setError(''); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5 text-primary" />Edit Team</DialogTitle></DialogHeader>
          {editTarget && (
            <TeamForm
              initial={{ name: editTarget.name, description: editTarget.description ?? '', memberIds: editTarget.members.map((m) => m.user.id) }}
              allEmployees={allEmployees} isLoading={isLoading} error={error}
              onSubmit={handleEdit} onCancel={() => setEditTarget(null)} submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); setError(''); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Delete Team</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? Members will not be deleted.
          </p>
          {error && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1" disabled={isLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="flex-1">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting…</> : 'Delete Team'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
