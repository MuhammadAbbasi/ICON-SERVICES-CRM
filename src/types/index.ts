export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CLIENT';
export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
}

export interface SubtaskData {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  assignee?: UserSummary | null;
  subtasks: SubtaskData[];
}

export interface DomainData {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  tasks: TaskData[];
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: number | null;
  progress: number;
  company: { id: string; name: string };
  domains: DomainData[];
  createdAt: Date;
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      companyId?: string;
      companyName?: string;
    };
  }
}
