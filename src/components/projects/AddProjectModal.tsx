'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Company { id: string; name: string; }
interface Props { open: boolean; onOpenChange: (v: boolean) => void; companies: Company[]; }

const DOMAIN_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const DEFAULT_DOMAINS = ['Civil Works', 'Electrical Works', 'Plumbing Works'];

interface DomainEntry { name: string; color: string; }

export function AddProjectModal({ open, onOpenChange, companies }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [priority, setPriority] = useState('MEDIUM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [domains, setDomains] = useState<DomainEntry[]>(
    DEFAULT_DOMAINS.map((name, i) => ({ name, color: DOMAIN_COLORS[i] }))
  );

  function addDomain() {
    setDomains((prev) => [...prev, { name: '', color: DOMAIN_COLORS[prev.length % DOMAIN_COLORS.length] }]);
  }

  function removeDomain(i: number) {
    setDomains((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateDomain(i: number, field: keyof DomainEntry, value: string) {
    setDomains((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  }

  function resetForm() {
    setStep(1); setName(''); setDescription(''); setCompanyId('');
    setStatus('ACTIVE'); setPriority('MEDIUM'); setStartDate(''); setEndDate('');
    setBudget(''); setError('');
    setDomains(DEFAULT_DOMAINS.map((name, i) => ({ name, color: DOMAIN_COLORS[i] })));
  }

  async function handleSubmit() {
    if (!name.trim() || !companyId) { setError('Project name and client are required.'); return; }
    setIsLoading(true); setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, companyId, status, priority,
          startDate: startDate || null,
          endDate: endDate || null,
          budget: budget ? parseFloat(budget) : null,
          domains: domains.filter((d) => d.name.trim()),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const project = await res.json();
      onOpenChange(false);
      resetForm();
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            New Project
          </DialogTitle>
          <DialogDescription>
            Step {step} of 2 — {step === 1 ? 'Project Details' : 'Domains & Scope'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2 mb-1">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project Name *</Label>
              <Input id="proj-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DHA Residential Complex — Block C" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">Description</Label>
              <Textarea id="proj-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief overview of project scope…" rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label>Client / Company *</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Select client…" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['ACTIVE','ON_HOLD','COMPLETED','CANCELLED'].map((s) => (
                      <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['LOW','MEDIUM','HIGH','CRITICAL'].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start Date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End Date</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (PKR)</Label>
              <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 45000000" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Define work domains (categories) for this project. You can add more later.
            </p>
            <div className="space-y-2">
              {domains.map((domain, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={domain.color}
                    onChange={(e) => updateDomain(i, 'color', e.target.value)}
                    className="h-9 w-9 rounded-md border border-input cursor-pointer bg-transparent p-1"
                    title="Domain color"
                  />
                  <Input
                    value={domain.name}
                    onChange={(e) => updateDomain(i, 'name', e.target.value)}
                    placeholder={`Domain ${i + 1} name`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={() => removeDomain(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addDomain} className="gap-2 w-full">
              <Plus className="h-4 w-4" /> Add Domain
            </Button>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
          )}
          {step === 1 ? (
            <Button
              onClick={() => { if (!name.trim() || !companyId) { setError('Name and client are required.'); return; } setError(''); setStep(2); }}
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</> : 'Create Project'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
