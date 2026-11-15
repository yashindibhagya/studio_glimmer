import { requireAdmin } from "@/lib/auth";
import { ensureSeeded } from "@/lib/data";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { FaqManager } from "@/components/admin/faq-manager";

export const metadata = { title: "FAQs" };

export default async function FaqsAdminPage() {
  await requireAdmin();
  await ensureSeeded();
  const faqs = (await store.list("faqs")).sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <PageHeader title="FAQs" description="The first 5 appear on the homepage; all appear on the FAQ page." />
      <FaqManager faqs={faqs} />
    </>
  );
}
