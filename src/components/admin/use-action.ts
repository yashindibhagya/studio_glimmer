"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Runs a server action, shows any error, then refreshes the page data. */
export function useAdminAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) =>
    new Promise<boolean>((resolve) =>
      start(async () => {
        const res = await fn();
        if (!res.ok) {
          alert(res.error ?? "Something went wrong");
          resolve(false);
          return;
        }
        onOk?.();
        router.refresh();
        resolve(true);
      }),
    );
  return { pending, run };
}
