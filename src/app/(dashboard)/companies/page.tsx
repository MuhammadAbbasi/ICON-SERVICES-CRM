import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Building2, Phone, Mail, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) redirect('/');

  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { projects: true, users: true } },
    },
  });

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Companies" description={`${companies.length} clients in workspace`} />
      <div className="flex-1 p-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{company.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {company._count.projects} projects · {company._count.users} users
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {company.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />{company.email}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />{company.phone}
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />{company.website}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
