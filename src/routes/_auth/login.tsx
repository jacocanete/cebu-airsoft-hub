import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthHeader } from "@/components/shared/auth-header";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [{ title: "Login | Cebu Airsoft Hub" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "",
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  function handleSuccess() {
    if (redirect) {
      window.location.href = redirect;
    } else {
      navigate({ to: "/feed", search: { tag: undefined, sort: "new", category: "All" } });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <AuthHeader title="Welcome back" subtitle="Sign in to your account" />

        <LoginForm onSuccess={handleSuccess} />

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Register
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
