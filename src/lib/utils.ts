import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} Lac`;
  return new Intl.NumberFormat('en-PK').format(amount);
}

export function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

// Kanban project phases
export const KANBAN_COLUMNS = [
  { id: 'UNDER_REVIEW',          label: 'Under Review',           accent: 'bg-slate-500',   ring: 'ring-slate-500/20',   text: 'text-slate-600 dark:text-slate-400',   border: 'border-slate-200 dark:border-slate-700' },
  { id: 'CONTRACT_FILLED',       label: 'Contract Filled',        accent: 'bg-violet-500',  ring: 'ring-violet-500/20',  text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  { id: 'ONGOING',               label: 'Ongoing',                accent: 'bg-indigo-500',  ring: 'ring-indigo-500/20',  text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  { id: 'UNDER_CUSTOMER_REVIEW', label: 'Under Customer Review',  accent: 'bg-amber-500',   ring: 'ring-amber-500/20',   text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800' },
  { id: 'COMPLETED',             label: 'Completed',              accent: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
] as const;

export type KanbanStatus = typeof KANBAN_COLUMNS[number]['id'];

// Task-level statuses (inside project detail)
export const TASK_STATUS_CONFIG = {
  TODO:        { label: 'To Do',       color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  REVIEW:      { label: 'Review',      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  DONE:        { label: 'Done',        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  BLOCKED:     { label: 'Blocked',     color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
} as const;

export const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      color: 'text-slate-500', dot: 'bg-slate-400' },
  MEDIUM:   { label: 'Medium',   color: 'text-amber-600', dot: 'bg-amber-400' },
  HIGH:     { label: 'High',     color: 'text-orange-600', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Critical', color: 'text-rose-600',  dot: 'bg-rose-500' },
} as const;

export const ROLE_CONFIG = {
  ADMIN:    { label: 'Admin',    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' },
  MANAGER:  { label: 'Manager',  color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' },
  EMPLOYEE: { label: 'Employee', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
  CLIENT:   { label: 'Client',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
} as const;

// Keep for backward compat in project detail
export const STATUS_CONFIG = {
  ...TASK_STATUS_CONFIG,
  UNDER_REVIEW:          { label: 'Under Review',          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  CONTRACT_FILLED:       { label: 'Contract Filled',       color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  ONGOING:               { label: 'Ongoing',               color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  UNDER_CUSTOMER_REVIEW: { label: 'Under Customer Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  COMPLETED:             { label: 'Completed',             color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
} as const;
