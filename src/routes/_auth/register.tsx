import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AuthHeader } from "@/components/shared/auth-header";
import { SignupForm } from "@/components/auth/signup-form";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";

export const Route = createFileRoute("/_auth/register")({
  head: () => ({
    meta: [{ title: "Register | Cebu Airsoft Hub" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <AuthHeader title="Check your email" subtitle="One last step to activate your account" />

          <div className="rounded border border-border bg-card p-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-primary" aria-hidden />
            <p className="mt-4 text-sm text-foreground">
              We sent a verification link to
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground break-all">
              {submittedEmail}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Click the link in the email to activate your account. The link expires in 60 minutes.
            </p>
          </div>

          <div className="mt-4">
            <ResendVerificationButton email={submittedEmail} />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Wrong email?{" "}
              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Start over
              </button>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="label-military text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <AuthHeader title="Join the ranks" subtitle="Create your operator account" />

        <SignupForm onSuccess={setSubmittedEmail} />

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              search={{ redirect: "" }}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="label-military text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
