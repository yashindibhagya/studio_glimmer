import { Loader2 } from "lucide-react";

export function AdminLoading() {
  return (
    <div className="text-muted flex items-center justify-center gap-2 py-32" role="status">
      <Loader2 className="size-5 animate-spin" /> Loading…
    </div>
  );
}
