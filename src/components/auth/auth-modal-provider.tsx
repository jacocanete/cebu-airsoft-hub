import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

type AuthView = "signup" | "login";

interface AuthModalState {
  isOpen: boolean;
  view: AuthView;
  pendingCallback: (() => void) | null;
}

interface AuthModalContextValue {
  isOpen: boolean;
  view: AuthView;
  pendingCallback: (() => void) | null;
  open: (opts?: { onSuccess?: () => void; view?: AuthView }) => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

interface AuthModalProviderProps {
  children: ReactNode;
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [state, setState] = useState<AuthModalState>({
    isOpen: false,
    view: "signup",
    pendingCallback: null,
  });

  // Store the callback in a ref so we can call it after auth without stale
  // closure issues — the ref always points to the latest callback.
  const callbackRef = useRef<(() => void) | null>(null);

  const open = useCallback(
    (opts?: { onSuccess?: () => void; view?: AuthView }) => {
      callbackRef.current = opts?.onSuccess ?? null;
      setState({
        isOpen: true,
        view: opts?.view ?? "signup",
        pendingCallback: opts?.onSuccess ?? null,
      });
    },
    [],
  );

  const close = useCallback(() => {
    callbackRef.current = null;
    setState({ isOpen: false, view: "signup", pendingCallback: null });
  }, []);

  const value = useMemo(
    () => ({
      isOpen: state.isOpen,
      view: state.view,
      pendingCallback: callbackRef.current,
      open,
      close,
    }),
    [state.isOpen, state.view, open, close],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}
