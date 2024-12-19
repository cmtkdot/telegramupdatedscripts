'use client';

import { SiteHeader } from '@/components/site-header';
import { DatabaseManager } from '@/components/database/database-manager';
import { TableView } from '@/components/database/table-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DatabasePage() {
  return (
    <>
      <SiteHeader className="glass" />
      <main className="container py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white glow mb-2">Database Management</h1>
            <p className="text-white/60">
              Manage your Supabase database connection and view database status
            </p>
          </div>

          <DatabaseManager />
          
          <Tabs defaultValue="bot_activities" className="space-y-4">
            <TabsList className="glass border-white/10">
              <TabsTrigger value="bot_activities">Bot Activities</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="bot_activities">
              <TableView table="bot_activities" />
            </TabsContent>
            <TabsContent value="channels">
              <TableView table="channels" />
            </TabsContent>
            <TabsContent value="media">
              <TableView table="media" />
            </TabsContent>
            <TabsContent value="messages">
              <TableView table="messages" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}