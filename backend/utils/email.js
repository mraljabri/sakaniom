const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(toEmail, name, code) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f9fafb; padding: 40px 0; margin: 0;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: #2563eb; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏠 SakaniOM</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">سكني عُمان</p>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #1f2937; margin: 0 0 8px;">Hello ${name},</h2>
          <p style="color: #6b7280; margin: 0 0 32px;">Enter the verification code below to activate your SakaniOM account:</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #2563eb;">${code}</span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">This code expires in <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
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
    subject: `${code} — Your SakaniOM Verification Code`,
    html,
  });
}

module.exports = { sendVerificationEmail };
