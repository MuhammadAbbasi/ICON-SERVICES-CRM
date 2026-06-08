import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, ROLE_CONFIG, cn } from '@/lib/utils';
import type { Role } from '@/types';

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) redirect('/');

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    include: {
      company: { select: { name: true } },
      _count: { select: { assignedTasks: true } },
    },
  });

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Team" description={`${users.length} members`} />
      <div className="flex-1 p-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => {
            const roleCfg = ROLE_CONFIG[user.role as Role];
            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded-md', roleCfg?.color)}>
                        {roleCfg?.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user._count.assignedTasks} tasks
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
