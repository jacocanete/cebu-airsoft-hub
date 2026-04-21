import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendEmailBackground } from "./lib/mailer.js";
import { verificationEmail } from "./lib/email-templates.js";

const VERIFICATION_EXPIRES_SECONDS = 60 * 60;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production",
  trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    expiresIn: VERIFICATION_EXPIRES_SECONDS,
    sendVerificationEmail: async ({ user, token }) => {
      const apiBase = process.env.BETTER_AUTH_URL ?? "http://localhost:3001";
      const clientBase = process.env.CLIENT_URL ?? "http://localhost:3000";
      const callbackURL = encodeURIComponent(`${clientBase}/verify-email`);
      const verifyUrl = `${apiBase}/api/auth/verify-email?token=${token}&callbackURL=${callbackURL}`;

      const rendered = verificationEmail({
        userName: user.name,
        verifyUrl,
        expiresInMinutes: Math.floor(VERIFICATION_EXPIRES_SECONDS / 60),
      });

      sendEmailBackground(
        { to: user.email, ...rendered },
        { purpose: "verify-email", userId: user.id },
      );
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
      },
      // Site-wide role. Never writable by the user — set via the CLI grant-role
      // script or the ADMIN role-change endpoint.
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
