import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/loading-state";
import { AdminNav } from "@/components/admin/admin-nav";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:flex">
      <AdminNav />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<AdminLoading />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
