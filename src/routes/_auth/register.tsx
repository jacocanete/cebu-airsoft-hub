import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthHeader } from "@/components/shared/auth-header";
import { SignupForm } from "@/components/auth/signup-form";

export const Route = createFileRoute("/_auth/register")({
  head: () => ({
    meta: [{ title: "Register | Cebu Airsoft Hub" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  function handleSuccess() {
    navigate({ to: "/feed", search: { tag: undefined, sort: "new", category: "All" } });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <AuthHeader title="Join the ranks" subtitle="Create your operator account" />

        <SignupForm onSuccess={handleSuccess} />

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
