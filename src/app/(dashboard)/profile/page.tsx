import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { getInitials, ROLE_CONFIG, cn } from '@/lib/utils';
import type { Role } from '@/types';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const roleCfg = ROLE_CONFIG[user.role as Role];

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Profile" description="Manage your account and security settings" />

      <div className="flex-1 p-6 space-y-6 animate-fade-in max-w-2xl">
        {/* Identity card */}
        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {getInitials(user.name ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {roleCfg && (
                <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-md mt-1', roleCfg.color)}>
                  {roleCfg.label}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Passwords are encrypted with bcrypt (cost factor 12) before storage. Choose at least 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
