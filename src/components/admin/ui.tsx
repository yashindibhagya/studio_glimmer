import Link from "next/link";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="text-muted mb-2 inline-block text-sm hover:text-rose-deep">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-bronze text-4xl">{title}</h1>
        {description && <p className="text-muted mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-ivory border-line rounded-3xl border p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-rose" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? "left-5.5" : "left-0.5"}`} />
      </button>
      <span>
        <span className="text-bronze block text-sm">{label}</span>
        {hint && <span className="text-muted block text-xs">{hint}</span>}
      </span>
    </label>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-rose text-white",
    in_progress: "bg-amber-100 text-amber-900",
    quoted: "bg-sky-100 text-sky-900",
    completed: "bg-emerald-100 text-emerald-900",
    archived: "bg-stone-200 text-stone-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[0.65rem] tracking-wider uppercase ${map[status] ?? "bg-line"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "quoted", label: "Quoted" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;
