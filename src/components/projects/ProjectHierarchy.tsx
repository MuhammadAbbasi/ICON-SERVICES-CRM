'use client';

import { useState, useRef } from 'react';
import {
  ChevronDown, ChevronRight, Plus, CheckSquare, Square, Clock,
  AlertCircle, CheckCircle2, XCircle, Layers3, ListTodo,
  Pencil, Trash2, Loader2, CornerDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TaskModal, type UserOption } from './TaskModal';
import { cn, TASK_STATUS_CONFIG, PRIORITY_CONFIG, getInitials } from '@/lib/utils';
import type { TaskStatus, Priority } from '@/types';

const STATUS_ICONS: Record<string, React.ElementType> = {
  TODO: Square, IN_PROGRESS: Clock, REVIEW: AlertCircle, DONE: CheckCircle2, BLOCKED: XCircle,
};

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface Subtask  { id: string; title: string; completed: boolean; }
interface Task {
  id: string; title: string; description?: string | null;
  status: string; priority: string; dueDate?: Date | null;
  assigneeId?: string | null;
  assignee?: { id: string; name: string } | null;
  subtasks: Subtask[];
}
interface Domain   { id: string; name: string; description?: string | null; color?: string | null; tasks: Task[]; }
interface Props    { domains: Domain[]; projectId: string; canEdit: boolean; users: UserOption[]; }

/* ─── Subtask row ───────────────────────────────────────────────────────────── */
function SubtaskRow({ subtask, canEdit, onToggle, onDelete }: {
  subtask: Subtask;
  canEdit: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      await fetch(`/api/subtasks/${subtask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !subtask.completed }),
      });
      onToggle(subtask.id, !subtask.completed);
    } finally { setPending(false); }
  }

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 group/sub">
      <button
        onClick={toggle}
        disabled={pending || !canEdit}
        className={cn('flex-shrink-0 transition-colors', canEdit ? 'cursor-pointer' : 'cursor-default')}
      >
        {pending
          ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          : subtask.completed
          ? <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
          : <Square className="h-3.5 w-3.5 text-muted-foreground group-hover/sub:text-foreground/60" />}
      </button>
      <span className={cn('text-xs flex-1', subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground/80')}>
        {subtask.title}
      </span>
      {canEdit && (
        <button
          onClick={() => onDelete(subtask.id)}
          className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/* ─── Inline subtask adder ─────────────────────────────────────────────────── */
function AddSubtaskInput({ taskId, onAdd }: { taskId: string; onAdd: (sub: Subtask) => void }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!value.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, title: value.trim() }),
      });
      if (res.ok) { onAdd(await res.json()); setValue(''); inputRef.current?.focus(); }
    } finally { setSaving(false); }
  }

  return (
    <div className="flex items-center gap-2 px-2 mt-1">
      <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        placeholder="Add subtask… (Enter to save)"
        className="h-7 text-xs border-dashed bg-transparent"
      />
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />}
    </div>
  );
}

/* ─── Task row ──────────────────────────────────────────────────────────────── */
function TaskRow({ task: initialTask, canEdit, users, onDelete, domainName, domainId }: {
  task: Task;
  canEdit: boolean;
  users: UserOption[];
  domainName: string;
  domainId: string;
  onDelete: (id: string) => void;
}) {
  const [task, setTask] = useState(initialTask);
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusCfg   = TASK_STATUS_CONFIG[task.status as TaskStatus];
  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];
  const StatusIcon  = STATUS_ICONS[task.status] ?? Square;
  const done        = task.subtasks.filter((s) => s.completed).length;

  function handleSubtaskToggle(id: string, completed: boolean) {
    setTask((prev) => ({ ...prev, subtasks: prev.subtasks.map((s) => s.id === id ? { ...s, completed } : s) }));
  }

  function handleSubtaskAdd(sub: Subtask) {
    setTask((prev) => ({ ...prev, subtasks: [...prev.subtasks, sub] }));
  }

  function handleSubtaskDelete(id: string) {
    fetch(`/api/subtasks/${id}`, { method: 'DELETE' });
    setTask((prev) => ({ ...prev, subtasks: prev.subtasks.filter((s) => s.id !== id) }));
  }

  async function handleDelete() {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
    if (res.ok) { onDelete(task.id); } else { setDeleting(false); }
  }

  return (
    <>
      <div className={cn(
        'group/task border border-border/60 rounded-xl overflow-hidden bg-card hover:border-border transition-colors',
        deleting && 'opacity-40 pointer-events-none'
      )}>
        {/* Task header row */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors select-none',
            expanded && 'bg-muted/20'
          )}
          onClick={() => setExpanded((v) => !v)}
        >
          <StatusIcon className={cn('h-4 w-4 flex-shrink-0', statusCfg?.color.split(' ').find(c => c.startsWith('text-')))} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">{task.title}</span>
              <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded-md', statusCfg?.color)}>
                {statusCfg?.label}
              </span>
              <span className={cn('text-[11px] font-medium flex items-center gap-1', priorityCfg?.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', priorityCfg?.dot)} />
                {priorityCfg?.label}
              </span>
            </div>
            {task.description && !expanded && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-1">
            {task.assignee && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{task.assignee.name.split(' ')[0]}</span>
              </div>
            )}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground font-medium tabular-nums">
                {done}/{task.subtasks.length}
              </span>
            )}

            {/* Edit / Delete — visible on hover */}
            {canEdit && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-3 pt-2 border-t border-border/50 bg-muted/10 space-y-1">
            {task.description && (
              <p className="text-xs text-muted-foreground leading-relaxed pb-2">{task.description}</p>
            )}

            {task.subtasks.length > 0 && (
              <>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-1">
                  Subtasks
                </p>
                {task.subtasks.map((sub) => (
                  <SubtaskRow
                    key={sub.id} subtask={sub} canEdit={canEdit}
                    onToggle={handleSubtaskToggle} onDelete={handleSubtaskDelete}
                  />
                ))}
              </>
            )}

            {canEdit && (
              <AddSubtaskInput taskId={task.id} onAdd={handleSubtaskAdd} />
            )}

            {task.subtasks.length === 0 && !canEdit && (
              <p className="text-xs text-muted-foreground/50 px-2">No subtasks.</p>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <TaskModal
        open={editOpen}
        onOpenChange={setEditOpen}
        domainId={domainId}
        domainName={domainName}
        users={users}
        existingTask={task as any}
        onSuccess={(updated) => setTask((prev) => ({ ...prev, ...updated }))}
      />
    </>
  );
}

/* ─── Domain section ────────────────────────────────────────────────────────── */
function DomainSection({ domain: initialDomain, canEdit, users }: {
  domain: Domain;
  canEdit: boolean;
  users: UserOption[];
}) {
  const [domain, setDomain] = useState(initialDomain);
  const [expanded, setExpanded] = useState(true);
  const [addOpen, setAddOpen]   = useState(false);
  const done = domain.tasks.filter((t) => t.status === 'DONE').length;

  function handleTaskAdded(task: Task) {
    setDomain((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
  }

  function handleTaskDeleted(id: string) {
    setDomain((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  }

  return (
    <>
      <div className="rounded-xl border bg-card/50 overflow-hidden">
        <div
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors text-left cursor-pointer select-none"
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded((v) => !v); }}
        >
          <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: domain.color ?? '#6366f1' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{domain.name}</span>
              <span className="text-xs text-muted-foreground">{done}/{domain.tasks.length} done</span>
            </div>
            {domain.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{domain.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit && (
              <Button
                variant="subtle" size="icon-sm"
                className="h-7 w-7"
                title="Add task"
                onClick={(e) => { e.stopPropagation(); setAddOpen(true); }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            {expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-4 space-y-2">
            {domain.tasks.length === 0 ? (
              <div
                className={cn(
                  'flex items-center gap-2 text-sm text-muted-foreground py-3 px-2 rounded-lg border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-all',
                  !canEdit && 'cursor-default hover:border-border/50 hover:bg-transparent'
                )}
                onClick={canEdit ? () => setAddOpen(true) : undefined}
              >
                <ListTodo className="h-4 w-4 flex-shrink-0" />
                {canEdit
                  ? <span>No tasks yet. <span className="text-primary font-medium">Click to add the first task.</span></span>
                  : <span>No tasks yet.</span>}
              </div>
            ) : (
              domain.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  canEdit={canEdit}
                  users={users}
                  domainName={domain.name}
                  domainId={domain.id}
                  onDelete={handleTaskDeleted}
                />
              ))
            )}
          </div>
        )}
      </div>

      <TaskModal
        open={addOpen}
        onOpenChange={setAddOpen}
        domainId={domain.id}
        domainName={domain.name}
        users={users}
        onSuccess={handleTaskAdded}
      />
    </>
  );
}

/* ─── Root export ───────────────────────────────────────────────────────────── */
export function ProjectHierarchy({ domains, projectId, canEdit, users }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers3 className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold text-foreground">Project Domains &amp; Tasks</h2>
        <span className="text-sm text-muted-foreground">({domains.length})</span>
      </div>

      {domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center border rounded-xl bg-card/50">
          <Layers3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No domains defined for this project yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <DomainSection key={domain.id} domain={domain} canEdit={canEdit} users={users} />
          ))}
        </div>
      )}
    </div>
  );
}
