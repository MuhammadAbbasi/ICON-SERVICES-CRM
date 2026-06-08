'use client';

import { useState, useRef } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KANBAN_COLUMNS } from '@/lib/utils';
import type { KanbanProject } from './KanbanProjectCard';

interface Props {
  initialProjects: KanbanProject[];
  canDrag: boolean;
}

export function KanbanBoard({ initialProjects, canDrag }: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const draggedId = useRef<string | null>(null);
  const prevStatus = useRef<string | null>(null);

  const grouped = Object.fromEntries(
    KANBAN_COLUMNS.map((col) => [
      col.id,
      projects.filter((p) => p.status === col.id),
    ])
  );

  function handleDragStart(id: string, status: string) {
    draggedId.current = id;
    prevStatus.current = status;
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    if (dragOver !== colId) setDragOver(colId);
  }

  function handleDragLeave() {
    setDragOver(null);
  }

  async function handleDrop(e: React.DragEvent, colId: string) {
    e.preventDefault();
    setDragOver(null);

    const id = draggedId.current;
    const old = prevStatus.current;
    if (!id || !old || colId === old) return;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: colId } : p))
    );
    draggedId.current = null;

    try {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: colId }),
      });
      if (!res.ok) throw new Error('failed');
    } catch {
      // Revert
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: old } : p))
      );
    }
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          column={col}
          projects={grouped[col.id] ?? []}
          isDragOver={dragOver === col.id}
          canDrag={canDrag}
          onDragStart={handleDragStart}
          onDragOver={(e) => handleDragOver(e, col.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, col.id)}
        />
      ))}
    </div>
  );
}
