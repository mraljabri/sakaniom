const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(toEmail, name, token) {
  const baseUrl = process.env.BASE_URL || 'https://sakaniom.onrender.com';
  const link = `${baseUrl}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f9fafb; padding: 40px 0; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: #2563eb; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏠 SakaniOM</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">سكني عُمان</p>
        </div>
        <div style="padding: 40px 32px; text-align: center;">
          <h2 style="color: #1f2937; margin: 0 0 8px;">Hello ${name}!</h2>
          <p style="color: #6b7280; margin: 0 0 32px; line-height: 1.6;">
            Thank you for signing up to SakaniOM. Click the button below to confirm your account and get started.
          </p>
          <a href="${link}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; font-weight: bold; font-size: 16px; padding: 16px 40px; border-radius: 12px; margin-bottom: 32px;">
            ✅ Confirm My Account
          </a>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
            This link expires in <strong>24 hours</strong>. If you did not create an account, please ignore this email.
          </p>
          <p style="color: #d1d5db; font-size: 11px; margin: 16px 0 0; word-break: break-all;">
            Or copy this link: ${link}
          </p>
        </div>
        <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} SakaniOM — Rental Listings in Oman</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: 'SakaniOM <onboarding@resend.dev>',
    to: toEmail,
    subject: `Confirm your SakaniOM account`,
    html,
  });
}

module.exports = { sendVerificationEmail };
