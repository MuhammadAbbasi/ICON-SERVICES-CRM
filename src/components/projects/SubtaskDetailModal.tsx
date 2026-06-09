'use client';

import { useState } from 'react';
import { Loader2, ClipboardList, User, Users, Ruler, Calculator, StickyNote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const UNITS = [
  { value: 'nos',  label: 'nos — numbers' },
  { value: 'm',    label: 'm — metre' },
  { value: 'm²',   label: 'm² — sq. metre' },
  { value: 'm³',   label: 'm³ — cu. metre' },
  { value: 'km',   label: 'km — kilometre' },
  { value: 'kg',   label: 'kg — kilogram' },
  { value: 'ton',  label: 'ton — tonne' },
  { value: 'hrs',  label: 'hrs — hours' },
  { value: 'days', label: 'days' },
  { value: 'ls',   label: 'Lump Sum' },
];

export interface SubtaskDetail {
  id: string;
  title: string;
  completed: boolean;
  description?: string | null;
  assigneeName?: string | null;
  labourCount?: number | null;
  unit?: string | null;
  quantity?: number | null;
  rate?: number | null;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subtask: SubtaskDetail;
  canEdit: boolean;
  onSave: (updated: SubtaskDetail) => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
}

export function SubtaskDetailModal({ open, onOpenChange, subtask, canEdit, onSave }: Props) {
  const [form, setForm] = useState({
    description:  subtask.description  ?? '',
    assigneeName: subtask.assigneeName ?? '',
    labourCount:  subtask.labourCount  != null ? String(subtask.labourCount) : '',
    unit:         subtask.unit         ?? '',
    quantity:     subtask.quantity     != null ? String(subtask.quantity)    : '',
    rate:         subtask.rate         != null ? String(subtask.rate)        : '',
    notes:        subtask.notes        ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function set(k: keyof typeof form) {
    return (value: string) => { setForm((p) => ({ ...p, [k]: value })); setError(''); };
  }

  const qty    = parseFloat(form.quantity) || 0;
  const rate   = parseFloat(form.rate)     || 0;
  const amount = qty * rate;

  async function handleSave() {
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/subtasks/${subtask.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description:  form.description  || null,
          assigneeName: form.assigneeName || null,
          labourCount:  form.labourCount  ? parseInt(form.labourCount, 10) : null,
          unit:         form.unit         || null,
          quantity:     form.quantity     ? parseFloat(form.quantity)      : null,
          rate:         form.rate         ? parseFloat(form.rate)          : null,
          notes:        form.notes        || null,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      onSave({ ...subtask, ...updated });
      onOpenChange(false);
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Subtask Details
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-foreground/80 mt-0.5">
            {subtask.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="sub-desc" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5" /> Description / Scope
            </Label>
            <Textarea
              id="sub-desc"
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="Scope of work, material specs, site instructions…"
              rows={3}
              disabled={!canEdit}
              className="resize-none"
            />
          </div>

          {/* Labour */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Labour
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sub-sup" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> Supervisor / Assigned To
                </Label>
                <Input
                  id="sub-sup"
                  value={form.assigneeName}
                  onChange={(e) => set('assigneeName')(e.target.value)}
                  placeholder="e.g. Usman Khan"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-labour">No. of Labourers</Label>
                <Input
                  id="sub-labour"
                  type="number"
                  min="0"
                  value={form.labourCount}
                  onChange={(e) => set('labourCount')(e.target.value)}
                  placeholder="e.g. 8"
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          {/* Measurement & Cost */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" /> Measurement &amp; Cost
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select
                  value={form.unit || '__none'}
                  onValueChange={(v) => set('unit')(v === '__none' ? '' : v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-qty">Quantity</Label>
                <Input
                  id="sub-qty"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => set('quantity')(e.target.value)}
                  placeholder="0"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-rate">Rate (PKR)</Label>
                <Input
                  id="sub-rate"
                  type="number"
                  min="0"
                  step="1"
                  value={form.rate}
                  onChange={(e) => set('rate')(e.target.value)}
                  placeholder="0"
                  disabled={!canEdit}
                />
              </div>
            </div>

            {amount > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/15 px-4 py-2.5 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calculator className="h-3.5 w-3.5" /> Estimated Amount
                  <span className="text-xs text-muted-foreground/60">
                    ({qty} {form.unit || 'unit'} × PKR {rate.toLocaleString()})
                  </span>
                </span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(amount)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="sub-notes">Additional Notes</Label>
            <Textarea
              id="sub-notes"
              value={form.notes}
              onChange={(e) => set('notes')(e.target.value)}
              placeholder="Site observations, material notes, follow-ups…"
              rows={2}
              disabled={!canEdit}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {canEdit ? 'Cancel' : 'Close'}
            </Button>
            {canEdit && (
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : 'Save Details'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
