import axios from 'axios';

export const sendEarlyAccessConfirmationEmail = async ({ to, name }: { to: string; name: string }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing');
  }

  const payload = {
    sender: {
      name: "TRIVYA",
      email: "hello@trivya.in"
    },
    to: [
      {
        email: to,
        name: name
      }
    ],
    subject: "You're on the TRIVYA early access list",
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; background-color: #020204; color: #FFF; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #0c0c0f 0%, #1a1a2e 100%); padding: 40px; border-radius: 20px; border: 1px solid rgba(168, 85, 247, 0.15); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);">
        <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">🎉</span>
        </div>
        <h2 style="color: #a855f7; margin-top: 0; font-size: 22px; font-weight: 700; text-align: center;">Congratulations, ${name}!</h2>
        <p style="color: #d4d4d8; font-size: 15px; line-height: 1.7; text-align: center;">You have been selected for <strong style="color: #a855f7;">Early Access</strong> to <strong style="color: #ffffff;">TRIVYA</strong>.</p>
        <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 4px 0;">Your registered email</p>
            <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0;">${to}</p>
        </div>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; text-align: center;">We are rolling out access in waves. Keep an eye on your inbox for your exclusive access link.</p>
        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 28px 0;">
        <p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">Data speaks. Trivya stays neutral.</p>
    </div>
</body>
</html>`
  };

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Confirmation sent to: ${to}`);
    return { success: true, message: "Confirmation email sent" };
  } catch (error: any) {
    console.error('Brevo API error:', error.response?.data || error.message);
    throw new Error('Failed to send confirmation email');
  }
};
