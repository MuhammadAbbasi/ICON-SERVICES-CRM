'use client';

import Link from 'next/link';
import { Building2, GripVertical, Layers3, CheckSquare } from 'lucide-react';
import { cn, PRIORITY_CONFIG } from '@/lib/utils';
import type { Priority } from '@/types';

export interface KanbanProject {
  id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  company: { name: string };
  domains: Array<{ tasks: Array<{ status: string }> }>;
}

interface Props {
  project: KanbanProject;
  canDrag: boolean;
  onDragStart: (id: string, status: string) => void;
}

export function KanbanProjectCard({ project, canDrag, onDragStart }: Props) {
  const priorityCfg = PRIORITY_CONFIG[project.priority as Priority];
  const allTasks = project.domains.flatMap((d) => d.tasks);
  const doneTasks = allTasks.filter((t) => t.status === 'DONE').length;

  return (
    <div
      draggable={canDrag}
      onDragStart={canDrag ? () => onDragStart(project.id, project.status) : undefined}
      className={cn(
        'group bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm',
        'hover:border-primary/40 hover:shadow-md transition-all duration-150',
        canDrag && 'cursor-grab active:cursor-grabbing active:opacity-60 active:scale-[0.97]'
      )}
    >
      {/* Drag handle + priority */}
      <div className="flex items-center justify-between">
        <span className={cn('flex items-center gap-1.5 text-[11px] font-medium', priorityCfg?.color)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', priorityCfg?.dot)} />
          {priorityCfg?.label}
        </span>
        {canDrag && (
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
        )}
      </div>

      {/* Project name — clickable */}
      <Link href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors line-clamp-2">
          {project.name}
        </h3>
      </Link>

      {/* Client */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{project.company.name}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
        <span className="flex items-center gap-1">
          <Layers3 className="h-3 w-3" />
          {project.domains.length} domains
        </span>
        <span className="flex items-center gap-1">
          <CheckSquare className="h-3 w-3" />
          {doneTasks}/{allTasks.length} tasks
        </span>
        <span className="font-semibold text-foreground">{project.progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </div>
  );
}
