"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, type ActionResult } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(loginAction, { ok: false });
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="field-label">Email</span>
        <input name="email" type="email" autoComplete="username" required className="field" />
      </label>
      <label className="block">
        <span className="field-label">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
      </button>
    </form>
  );
}
