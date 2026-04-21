import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST ?? "localhost";
  const port = Number(process.env.SMTP_PORT ?? 1025);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: user && pass ? { user, pass } : undefined,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,
    rateDelta: 1000,
    connectionTimeout: 10_000,
    greetingTimeout: 5_000,
    socketTimeout: 20_000,
  });

  return transporter;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

type NodemailerError = Error & { code?: string; responseCode?: number };

function isTransient(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const e = err as NodemailerError;
  if (e.code && ["ECONNRESET", "ETIMEDOUT", "ESOCKET", "ECONNECTION", "EDNS"].includes(e.code)) {
    return true;
  }
  if (typeof e.responseCode === "number" && e.responseCode >= 400 && e.responseCode < 500) {
    return true;
  }
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.SMTP_FROM ?? "noreply@cebuairsofthub.local";
  const mail = {
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  };

  const maxAttempts = 3;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await getTransporter().sendMail(mail);
      return;
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts || !isTransient(err)) {
        console.error("[mailer] sendEmail failed", {
          attempt,
          subject: input.subject,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
      const backoff = 250 * 2 ** (attempt - 1) + Math.random() * 100;
      await sleep(backoff);
    }
  }
  throw lastErr;
}

export function sendEmailBackground(
  input: SendEmailInput,
  context?: { purpose: string; userId?: string },
): void {
  void sendEmail(input).catch((err) => {
    console.error("[mailer] background send failed", {
      purpose: context?.purpose,
      userId: context?.userId,
      subject: input.subject,
      error: err instanceof Error ? err.message : String(err),
    });
  });
}

export async function verifyTransport(): Promise<boolean> {
  try {
    await getTransporter().verify();
    return true;
  } catch (err) {
    console.warn("[mailer] SMTP transport verification failed — emails will not send", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
