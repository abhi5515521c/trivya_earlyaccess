import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';
import { sendEarlyAccessConfirmationEmail } from '../lib/brevo';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, persona, email, feedback } = req.body;
  if (!name || !persona || !email || !feedback) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  // Neon Integration automatically sets process.env.DATABASE_URL in Vercel
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    return res.status(500).json({ success: false, message: 'Internal Server Configuration Error' });
  }

  const pool = new Pool({ connectionString });

  try {
    // Insert data into early_access table
    const result = await pool.query(
      `INSERT INTO early_access (name, persona, email, feedback) VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, persona, email, feedback]
    );

    // Send the email using existing logic
    await sendEarlyAccessConfirmationEmail({ to: email, name });

    return res.status(200).json({ success: true, message: 'Registered successfully' });
  } catch (error: any) {
    console.error('Database/Email error:', error);
    // Handle unique constraint violation for duplicate email
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    // End the pool to prevent serverless function from hanging
    await pool.end();
  }
}
