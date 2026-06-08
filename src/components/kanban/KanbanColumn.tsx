'use client';

import { KanbanProjectCard, type KanbanProject } from './KanbanProjectCard';

interface ColumnMeta {
  id: string;
  label: string;
  accent: string;
  text: string;
  border: string;
}

interface Props {
  column: ColumnMeta;
  projects: KanbanProject[];
  isDragOver: boolean;
  canDrag: boolean;
  onDragStart: (id: string, status: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function KanbanColumn({ column, projects, isDragOver, canDrag, onDragStart, onDragOver, onDragLeave, onDrop }: Props) {
  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${column.accent} flex-shrink-0`} />
        <h2 className={`text-sm font-semibold ${column.text} flex-1 leading-tight`}>
          {column.label}
        </h2>
        <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 min-w-[22px] text-center">
          {projects.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        className={`flex-1 min-h-[200px] rounded-xl border-2 border-dashed p-2 space-y-2.5 transition-all duration-150 ${
          isDragOver
            ? `${column.border} bg-muted/60 scale-[1.01]`
            : 'border-transparent'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {projects.length === 0 && !isDragOver && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            No projects
          </div>
        )}
        {projects.map((project) => (
          <KanbanProjectCard
            key={project.id}
            project={project}
            canDrag={canDrag}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}
