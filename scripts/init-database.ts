import { supabase } from '../lib/supabase-client';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read SQL file
    const sql = readFileSync(join(__dirname, 'init-database.sql'), 'utf8');
    
    // Execute SQL in chunks to avoid timeout
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';'
      });
      
      if (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
    
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();