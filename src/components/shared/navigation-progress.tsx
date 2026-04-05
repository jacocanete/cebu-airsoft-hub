import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
  easing: "ease",
  speed: 300,
});

export function NavigationProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });

  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isLoading]);

  return null;
}
