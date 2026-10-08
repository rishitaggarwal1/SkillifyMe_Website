// Sends email through any SMTP provider (Gmail, Brevo, Zoho, ...), configured in server/.env
const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 uses SSL from the start; 587 upgrades with STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  return getTransporter().sendMail({
    from: process.env.MAIL_FROM || `SkillifyMe <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatRupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

// Purchase receipt: only the course bought and the amount paid
function buildCourseReceipt({ name, courseTitle, amount }) {
  const paid = formatRupees(amount);
  const subject = `Your SkillifyMe receipt – ${courseTitle}`;

  const text = [
    `Hi ${name},`,
    '',
    'Thank you for your purchase. Here is your receipt.',
    '',
    `Course purchased: ${courseTitle}`,
    `Amount paid: ${paid}`,
    '',
    '– SkillifyMe',
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
      <tr>
        <td style="padding:28px 28px 8px;">
          <p style="margin:0 0 4px;font-size:20px;font-weight:bold;color:#1d4ed8;">SkillifyMe</p>
          <p style="margin:0;font-size:13px;color:#64748b;">Payment receipt</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px 0;font-size:15px;line-height:1.5;">
          Hi ${escapeHtml(name)},<br>Thank you for your purchase. Here is your receipt.
        </td>
      </tr>
      <tr>
        <td style="padding:20px 28px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e2e8f0;font-size:15px;">
            <tr>
              <td style="padding:14px 0;color:#64748b;">Course purchased</td>
              <td style="padding:14px 0;text-align:right;font-weight:bold;">${escapeHtml(courseTitle)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-top:1px solid #e2e8f0;color:#64748b;">Amount paid</td>
              <td style="padding:14px 0;border-top:1px solid #e2e8f0;text-align:right;font-weight:bold;font-size:18px;">${escapeHtml(paid)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

module.exports = { mailConfigured, sendMail, buildCourseReceipt };
