export function getEmailHtml(email: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trivya Spot Confirmed</title>
      </head>
      <body style="margin: 0; padding: 40px 20px; background-color: #020204; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; width: 100% !important; height: 100% !important;">
        <div style="max-width: 440px; margin: 0 auto; background-color: #0c0c0f; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);">
          
          <!-- Header Logo -->
          <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 16px; margin-bottom: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #d8b4fe; text-decoration: none;">Trivya</span>
                </td>
                <td style="text-align: right;">
                  <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #a78bfa; text-transform: uppercase;">Waitlist</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body Title -->
          <h1 style="font-size: 20px; font-weight: 600; letter-spacing: -0.01em; color: #ffffff; margin-top: 0; margin-bottom: 12px;">
            You're in.
          </h1>

          <!-- Body Text -->
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-top: 0; margin-bottom: 16px;">
            Hey there,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-top: 0; margin-bottom: 20px;">
            Your early access spot for <strong style="color: #ffffff; font-weight: 500;">${email}</strong> has been secured. We are building a transparent pricing platform to perfect verifying.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-top: 0; margin-bottom: 24px;">
            To help us customize the experience and launch faster, could you share 1 minute of your time to answer a few quick questions?
          </p>

          <!-- Colorful Gradient Button -->
          <div style="margin: 28px 0; text-align: center;">
            <a href="https://forms.gle/9qvcW7zxdCWpJYws6" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #c084fc 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-align: center; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
              Complete 1-Min Survey
            </a>
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 28px 0;" />

          <!-- Footer -->
          <p style="font-size: 11px; line-height: 1.4; color: #52525b; text-align: center; margin: 0;">
            Data speaks. Trivya stays neutral.
          </p>
          
        </div>
      </body>
    </html>
  `;
}
