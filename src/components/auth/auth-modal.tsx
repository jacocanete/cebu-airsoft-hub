import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { useAuthModal } from "@/components/auth/auth-modal-provider";

type AuthView = "signup" | "login";

export function AuthModal() {
  const { isOpen, view: initialView, pendingCallback, close } = useAuthModal();
  const [view, setView] = useState<AuthView>(initialView);

  // Sync local view state when the modal opens with a specific initial view
  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  function handleSuccess() {
    close();
    // Run after the modal closes so the session query has a tick to settle.
    // useLogin/useRegister already called invalidateQueries(["auth"]), so by
    // the time this microtask runs the refetch is in flight and the component
    // tree holding the action (VoteControl, CommentThread, etc.) is still
    // mounted with the right closure state.
    if (pendingCallback) {
      setTimeout(pendingCallback, 0);
    }
  }

  const isSignup = view === "signup";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSignup ? "Join the ranks" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {isSignup
              ? "Create your operator account to vote and comment."
              : "Sign in to your account to continue."}
          </DialogDescription>
        </DialogHeader>

        {isSignup ? (
          <SignupForm onSuccess={handleSuccess} />
        ) : (
          <LoginForm onSuccess={handleSuccess} />
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => setView("signup")}
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
