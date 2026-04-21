const BRAND = "Cebu Airsoft Hub";
const ACCENT = "#dc2626";
const BG = "#0a0a0a";
const CARD = "#141414";
const BORDER = "#262626";
const TEXT = "#f5f5f5";
const MUTED = "#a3a3a3";

function baseLayout({ title, bodyHtml }: { title: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${CARD};border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px 32px;border-bottom:1px solid ${BORDER};">
                <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${ACCENT};font-weight:700;">${BRAND}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${TEXT};font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:1.5;">
                This is an automated message from ${BRAND}. If you didn't request this, you can safely ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button({ href, label }: { href: string; label: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:${ACCENT};border-radius:4px;">
        <a href="${href}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function verificationEmail({
  userName,
  verifyUrl,
  expiresInMinutes,
}: {
  userName: string;
  verifyUrl: string;
  expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
  const greeting = userName ? `Hey ${userName},` : "Hey operator,";
  const bodyHtml = `
    <p style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:${TEXT};">Verify your email</p>
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 8px 0;">Tap the button below to confirm your email and activate your account.</p>
    ${button({ href: verifyUrl, label: "Verify email" })}
    <p style="margin:0 0 8px 0;color:${MUTED};font-size:12px;">Or paste this link into your browser:</p>
    <p style="margin:0 0 24px 0;word-break:break-all;"><a href="${verifyUrl}" style="color:${ACCENT};">${verifyUrl}</a></p>
    <p style="margin:0;color:${MUTED};font-size:12px;">This link expires in ${expiresInMinutes} minutes. If you didn't sign up, ignore this email.</p>
  `;

  const text = [
    `${greeting}`,
    "",
    "Verify your email for Cebu Airsoft Hub by opening this link:",
    verifyUrl,
    "",
    `This link expires in ${expiresInMinutes} minutes. If you didn't sign up, ignore this email.`,
  ].join("\n");

  return {
    subject: "Verify your email — Cebu Airsoft Hub",
    html: baseLayout({ title: "Verify your email", bodyHtml }),
    text,
  };
}
