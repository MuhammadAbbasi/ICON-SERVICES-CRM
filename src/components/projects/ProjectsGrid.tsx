'use client';

import Link from 'next/link';
import { Building2, ArrowRight, Layers3, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/utils';
import type { ProjectStatus, Priority } from '@/types';

interface ProjectSummary {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
  progress: number;
  company: { id: string; name: string };
  domains: Array<{ id: string; name: string; tasks: Array<{ id: string; status: string }> }>;
}

export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Layers3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium text-foreground/60">No projects yet</p>
        <p className="text-sm text-muted-foreground mt-1">Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => {
        const statusCfg = STATUS_CONFIG[project.status as ProjectStatus];
        const priorityCfg = PRIORITY_CONFIG[project.priority as Priority];
        const allTasks = project.domains.flatMap((d) => d.tasks);
        const doneTasks = allTasks.filter((t) => t.status === 'DONE').length;

        return (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="group h-full cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5">
              <CardContent className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary/60" />
                  </div>
                  <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-md', statusCfg?.color)}>
                    {statusCfg?.label}
                  </span>
                </div>

                {/* Title & company */}
                <div className="flex-1 space-y-1 mb-4">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" />
                    {project.company.name}
                  </p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Layers3 className="h-3.5 w-3.5" />
                    {project.domains.length} domains
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="h-3.5 w-3.5" />
                    {doneTasks}/{allTasks.length} tasks
                  </span>
                  <span className={cn('flex items-center gap-1 ml-auto font-medium', priorityCfg?.color)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', priorityCfg?.dot)} />
                    {priorityCfg?.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>

                {/* Footer arrow */}
                <div className="flex justify-end mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    View project <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
