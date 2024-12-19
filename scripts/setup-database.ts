import { supabase } from '../lib/supabase-client';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDatabase() {
  try {
    // Read SQL file
    const sql = readFileSync(
      join(__dirname, 'setup-database.sql'),
      'utf8'
    );

    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw error;
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Failed to setup database:', error);
    process.exit(1);
  }
}

setupDatabase();