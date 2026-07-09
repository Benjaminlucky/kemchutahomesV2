import Sentry from "@/lib/sentryClient";

export function onRouterTransitionStart(url: string) {
  Sentry.addBreadcrumb({ category: "navigation", message: `Navigated to ${url}` });
}
