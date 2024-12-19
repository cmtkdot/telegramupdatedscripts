'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Database, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export function DatabaseManager() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected'>('disconnected');

  const testConnection = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('channels')
        .select('count')
        .single();

      if (error) throw error;
      
      setConnectionStatus('connected');
    } catch (err) {
      setError('Failed to connect to database');
      setConnectionStatus('disconnected');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="glass border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Database Connection</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-white/60">
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Database URL</Label>
          <Input
            value={supabase.supabaseUrl}
            readOnly
            className="glass border-white/10 font-mono text-sm"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button
          onClick={testConnection}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Test Connection
        </Button>

        <div className="text-sm text-white/60">
          <p>To access your Supabase database:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Supabase.com</a></li>
            <li>Sign in to your account</li>
            <li>Open your project: <span className="font-mono">jgfivmrejdxcoeopcctk</span></li>
            <li>Navigate to the SQL Editor or Table Editor</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}