'use client';

import { useState } from 'react';
import { Plus, Building2, Mail, Phone, Globe, MapPin, Pencil, Trash2, Loader2, FolderKanban, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Company {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  _count: { projects: number; users: number };
}

interface FormState {
  name: string; email: string; phone: string; address: string; website: string;
}

const EMPTY: FormState = { name: '', email: '', phone: '', address: '', website: '' };

function CompanyForm({
  initial, isLoading, error, onSubmit, onCancel, submitLabel,
}: {
  initial: FormState;
  isLoading: boolean;
  error: string;
  onSubmit: (data: FormState) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Company Name *</Label>
        <Input value={form.name} onChange={set('name')} placeholder="e.g. Alpha Construction Ltd." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={form.email} onChange={set('email')} type="email" placeholder="contact@company.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Address</Label>
        <Input value={form.address} onChange={set('address')} placeholder="City, Country" />
      </div>
      <div className="space-y-1.5">
        <Label>Website</Label>
        <Input value={form.website} onChange={set('website')} placeholder="https://company.com" />
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>Cancel</Button>
        <Button onClick={() => onSubmit(form)} disabled={isLoading || !form.name.trim()} className="flex-1">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : submitLabel}
        </Button>
      </div>
    </div>
  );
}

export function CompaniesManager({ initialCompanies, isAdmin }: { initialCompanies: Company[]; isAdmin: boolean }) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(form: FormState) {
    setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/companies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const company = await res.json();
      setCompanies((prev) => [...prev, { ...company, _count: { projects: 0, users: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAdd(false);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }

  async function handleEdit(form: FormState) {
    if (!editTarget) return;
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`/api/companies/${editTarget.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const updated = await res.json();
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? { ...updated, _count: c._count } : c)));
      setEditTarget(null);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`/api/companies/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{companies.length} companies registered</p>
        <Button size="sm" onClick={() => { setError(''); setShowAdd(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companies.map((company) => (
          <Card key={company.id} className="group hover:shadow-md hover:border-primary/30 transition-all duration-150">
            <CardContent className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary/60" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{company.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />{company._count.projects} projects
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />{company._count.users} users
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button
                    variant="ghost" size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => { setError(''); setEditTarget(company); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost" size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => { setError(''); setDeleteTarget(company); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                {company.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />{company.phone}
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">{company.address}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                      className="truncate hover:text-primary transition-colors">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {!company.email && !company.phone && !company.address && !company.website && (
                  <p className="text-xs text-muted-foreground/50 italic">No contact details added</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No companies yet. Add your first client.</p>
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={showAdd} onOpenChange={(v) => { setShowAdd(v); setError(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Add Company</DialogTitle></DialogHeader>
          <CompanyForm initial={EMPTY} isLoading={isLoading} error={error} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} submitLabel="Create Company" />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); setError(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5 text-primary" />Edit Company</DialogTitle></DialogHeader>
          {editTarget && (
            <CompanyForm
              initial={{ name: editTarget.name, email: editTarget.email ?? '', phone: editTarget.phone ?? '', address: editTarget.address ?? '', website: editTarget.website ?? '' }}
              isLoading={isLoading} error={error}
              onSubmit={handleEdit}
              onCancel={() => setEditTarget(null)}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); setError(''); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Delete Company</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
            This will also remove all associated projects and data. This cannot be undone.
          </p>
          {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1" disabled={isLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="flex-1">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting…</> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
