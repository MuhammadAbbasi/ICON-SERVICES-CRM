'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, CheckSquare, Square, Clock, AlertCircle, CheckCircle2, XCircle, Layers3, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, STATUS_CONFIG, PRIORITY_CONFIG, getInitials } from '@/lib/utils';
import type { TaskStatus, Priority } from '@/types';

const TASK_STATUS_ICONS: Record<string, React.ElementType> = {
  TODO: Square, IN_PROGRESS: Clock, REVIEW: AlertCircle, DONE: CheckCircle2, BLOCKED: XCircle,
};

interface Subtask { id: string; title: string; completed: boolean; }
interface Task {
  id: string; title: string; description?: string | null;
  status: string; priority: string; dueDate?: Date | null;
  assignee?: { id: string; name: string } | null;
  subtasks: Subtask[];
}
interface Domain { id: string; name: string; description?: string | null; color?: string | null; tasks: Task[]; }
interface Props { domains: Domain[]; projectId: string; canEdit: boolean; }

function SubtaskRow({ subtask }: { subtask: Subtask }) {
  const [done, setDone] = useState(subtask.completed);
  return (
    <div
      className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer group"
      onClick={() => setDone(!done)}
    >
      {done
        ? <CheckSquare className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
        : <Square className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 group-hover:text-foreground/60" />}
      <span className={cn('text-xs', done ? 'line-through text-muted-foreground' : 'text-foreground/80')}>
        {subtask.title}
      </span>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[task.status as TaskStatus];
  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];
  const StatusIcon = TASK_STATUS_ICONS[task.status] ?? Square;
  const completedSubs = task.subtasks.filter((s) => s.completed).length;

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-card hover:border-border transition-colors">
      {/* Task header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors',
          expanded && 'bg-muted/20'
        )}
        onClick={() => task.subtasks.length > 0 && setExpanded(!expanded)}
      >
        <StatusIcon className={cn('h-4 w-4 flex-shrink-0', statusCfg?.color.split(' ')[1])} />

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
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
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
            <span className="text-xs text-muted-foreground font-medium">
              {completedSubs}/{task.subtasks.length}
            </span>
          )}
          {task.subtasks.length > 0 && (
            expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Subtasks */}
      {expanded && task.subtasks.length > 0 && (
        <div className="px-4 pb-3 pt-1 border-t border-border/50 bg-muted/10 space-y-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Subtasks
          </p>
          {task.subtasks.map((sub) => (
            <SubtaskRow key={sub.id} subtask={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

function DomainSection({ domain, canEdit }: { domain: Domain; canEdit: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const doneTasks = domain.tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="rounded-xl border bg-card/50 overflow-hidden">
      {/* Domain header */}
      <button
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: domain.color ?? '#6366f1' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{domain.name}</span>
            <span className="text-xs text-muted-foreground">
              {doneTasks}/{domain.tasks.length} done
            </span>
          </div>
          {domain.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{domain.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {canEdit && (
            <Button
              variant="ghost" size="icon-sm"
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"
              onClick={(e) => { e.stopPropagation(); }}
              title="Add task"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          {expanded
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Tasks list */}
      {expanded && (
        <div className="px-5 pb-4 space-y-2">
          {domain.tasks.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-3 px-2">
              <ListTodo className="h-4 w-4" />
              No tasks yet.{canEdit && ' Click + to add a task.'}
            </div>
          ) : (
            domain.tasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectHierarchy({ domains, projectId, canEdit }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Project Domains & Tasks</h2>
          <span className="text-sm text-muted-foreground">({domains.length})</span>
        </div>
      </div>

      {domains.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center border rounded-xl bg-card/50">
          <Layers3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No domains defined for this project yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <DomainSection key={domain.id} domain={domain} canEdit={canEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
