import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthHeader } from "@/components/shared/auth-header";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [{ title: "Verify email | Cebu Airsoft Hub" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { error } = Route.useSearch();
  const failed = Boolean(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <AuthHeader
          title={failed ? "Verification failed" : "Email verified"}
          subtitle={failed ? "This link is invalid or has expired" : "Your account is now active"}
        />

        <div className="rounded border border-border bg-card p-8 text-center">
          {failed ? (
            <XCircle className="mx-auto h-12 w-12 text-red-500" aria-hidden />
          ) : (
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {failed
              ? "Request a new verification link from the sign-in screen."
              : "You can close this tab. Sign in whenever you're ready."}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-center">
          <Link
            to="/login"
            search={{ redirect: "" }}
            className="flex h-10 w-full items-center justify-center rounded bg-primary text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Go to sign in
          </Link>
          <Link
            to="/"
            className="label-military text-muted-foreground/70 hover:text-muted-foreground transition-colors py-2"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
