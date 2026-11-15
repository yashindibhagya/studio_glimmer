import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { RequestList } from "@/components/admin/request-list";

export const metadata = { title: "Custom requests" };

export default async function RequestsPage() {
  await requireAdmin();
  const [requests, categories] = await Promise.all([store.list("requests"), store.list("categories")]);
  return (
    <>
      <PageHeader title="Custom Requests" description="Ideas sent through the Custom Order form. Reply on WhatsApp, then update the status." />
      <RequestList
        requests={requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
        categories={Object.fromEntries(categories.map((c) => [c.id, c.name]))}
      />
    </>
  );
}
