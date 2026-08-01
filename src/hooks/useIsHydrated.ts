"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = (): (() => void) => () => {};

export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
