'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';

export default function SupabasePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md glass border-white/10 p-6">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(147, 51, 234)',
                  brandAccent: 'rgb(126, 34, 206)',
                },
              },
            },
          }}
          providers={['github']}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </Card>
    </div>
  );
}