import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'DATABASE_URL is not set in Vercel environment variables' });
  }

  const pool = new Pool({ connectionString });

  try {
    const schema = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS early_access (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL CHECK (name != ''),
          persona TEXT NOT NULL CHECK (persona != ''),
          email TEXT UNIQUE NOT NULL CHECK (email != ''),
          transparency_feedback TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access(email);
    `;
    
    await pool.query(schema);
    return res.status(200).json({ success: true, message: 'Database initialized successfully on the Vercel-connected database!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  } finally {
    await pool.end();
  }
}
