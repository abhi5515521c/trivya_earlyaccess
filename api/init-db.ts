import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'No database url found' });
  }
  return res.status(200).json({ success: true, host: connectionString.substring(0, 70) });
}
