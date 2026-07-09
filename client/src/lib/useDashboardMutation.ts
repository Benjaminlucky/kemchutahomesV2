"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

// Thin wrapper so every dashboard mutation doesn't hand-roll the same
// busyId/try/catch/finally/alert boilerplate that EstatesTable and
// InspectionsTable each duplicated — callers get isPending/variables for
// free from React Query and only need to supply mutationFn + onSuccess.
// Pass your own onError to override the default alert().
export function useDashboardMutation<TResult, TVariables>(
  options: UseMutationOptions<TResult, Error, TVariables>,
) {
  return useMutation<TResult, Error, TVariables>({
    onError: (err) => alert(err instanceof Error ? err.message : "Something went wrong."),
    ...options,
  });
}
