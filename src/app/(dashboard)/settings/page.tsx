import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') redirect('/');

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Settings" description="Global configuration for ICON CRM" />
      <div className="flex-1 p-6 animate-fade-in">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Additional settings and configuration options will appear here in upcoming phases — user management, notification preferences, integrations, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
