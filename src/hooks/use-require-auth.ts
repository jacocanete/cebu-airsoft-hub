import { useCurrentUser } from "@/hooks/use-auth";
import { useAuthModal } from "@/components/auth/auth-modal-provider";

/**
 * Returns a wrapper that executes a callback only when the user is authenticated.
 * If not authenticated, opens the auth modal (sign-up first) with the callback
 * queued to replay automatically after successful login or registration.
 */
export function useRequireAuth() {
  const { data: session } = useCurrentUser();
  const authModal = useAuthModal();

  function requireAuth(callback: () => void) {
    if (session?.user) {
      callback();
    } else {
      authModal.open({ onSuccess: callback });
    }
  }

  return requireAuth;
}
