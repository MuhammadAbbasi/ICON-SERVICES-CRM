import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PKR') {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} Lac`;
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency }).format(amount);
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const STATUS_CONFIG = {
  ACTIVE:     { label: 'Active',      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ON_HOLD:    { label: 'On Hold',     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  COMPLETED:  { label: 'Completed',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  CANCELLED:  { label: 'Cancelled',   color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  TODO:       { label: 'To Do',       color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  IN_PROGRESS:{ label: 'In Progress', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  REVIEW:     { label: 'Review',      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  DONE:       { label: 'Done',        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  BLOCKED:    { label: 'Blocked',     color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
} as const;

export const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      color: 'text-slate-500', dot: 'bg-slate-400' },
  MEDIUM:   { label: 'Medium',   color: 'text-amber-600', dot: 'bg-amber-400' },
  HIGH:     { label: 'High',     color: 'text-orange-600', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Critical', color: 'text-rose-600',  dot: 'bg-rose-500' },
} as const;

export const ROLE_CONFIG = {
  ADMIN:    { label: 'Admin',    color: 'bg-rose-100 text-rose-700' },
  MANAGER:  { label: 'Manager',  color: 'bg-indigo-100 text-indigo-700' },
  EMPLOYEE: { label: 'Employee', color: 'bg-emerald-100 text-emerald-700' },
  CLIENT:   { label: 'Client',   color: 'bg-amber-100 text-amber-700' },
} as const;
