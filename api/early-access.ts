import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, persona, email, feedback } = req.body;
  if (!name || !persona || !email || !feedback) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    return res.status(500).json({ success: false, message: 'Internal Server Configuration Error' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is missing");
    return res.status(500).json({ success: false, message: 'Email Configuration Error' });
  }

  const pool = new Pool({ connectionString });

  try {
    // 1. Insert into Neon Postgres
    const result = await pool.query(
      `INSERT INTO early_access (name, persona, email, transparency_feedback) VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, persona, email, feedback]
    );

    // 2. Send email via Brevo using native fetch
    const payload = {
      sender: { name: "TRIVYA", email: "hello@trivya.in" },
      to: [{ email, name }],
      subject: "You're on the TRIVYA early access list",
      htmlContent: `<!DOCTYPE html><html><body style="font-family: 'Segoe UI', sans-serif; background-color: #020204; color: #FFF; padding: 40px 20px; margin: 0;"><div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #0c0c0f 0%, #1a1a2e 100%); padding: 40px; border-radius: 20px; border: 1px solid rgba(168, 85, 247, 0.15); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);"><div style="text-align: center; margin-bottom: 24px;"><span style="font-size: 48px;">🎉</span></div><h2 style="color: #a855f7; margin-top: 0; font-size: 22px; font-weight: 700; text-align: center;">Congratulations, ${name}!</h2><p style="color: #d4d4d8; font-size: 15px; line-height: 1.7; text-align: center;">You have been selected for <strong style="color: #a855f7;">Early Access</strong> to <strong style="color: #ffffff;">TRIVYA</strong>.</p><div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;"><p style="color: #a1a1aa; font-size: 13px; margin: 0 0 4px 0;">Your registered email</p><p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0;">${email}</p></div><p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; text-align: center;">We are rolling out access in waves. Keep an eye on your inbox for your exclusive access link.</p><hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 28px 0;"><p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">Data speaks. Trivya stays neutral.</p></div></body></html>`
    };

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error('Brevo API Error:', errText);
      // We still return success if DB worked but email failed, or we can fail. We choose to fail gracefully.
    }

    return res.status(200).json({ success: true, message: 'Registered successfully' });
  } catch (error: any) {
    console.error('Database/Email error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await pool.end();
  }
}
