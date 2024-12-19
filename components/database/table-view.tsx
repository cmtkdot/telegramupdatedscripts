'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface TableViewProps {
  table: string;
}

export function TableView({ table }: TableViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select('*');
      
      if (searchQuery) {
        // Add search filter if a query is present
        query = query.or(`id.ilike.%${searchQuery}%,created_at.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      setData(data);
      if (data.length > 0) {
        setColumns(Object.keys(data[0]));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white capitalize">
          {table.replace(/_/g, ' ')}
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 glass border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={loadData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Load Data'
            )}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="text-red-400 text-sm p-4">{error}</div>
      ) : (
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="text-white">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column} className="text-white/60">
                      {typeof row[column] === 'object'
                        ? JSON.stringify(row[column])
                        : String(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && data.length === 0 && (
            <div className="text-center text-white/40 py-8">
              No data available
            </div>
          )}
        </div>
      )}
    </Card>
  );
}