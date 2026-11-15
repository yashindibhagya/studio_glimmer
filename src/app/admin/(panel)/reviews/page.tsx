import { requireAdmin } from "@/lib/auth";
import { ensureSeeded } from "@/lib/data";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { ReviewManager } from "@/components/admin/review-manager";

export const metadata = { title: "Reviews" };

export default async function ReviewsAdminPage() {
  await requireAdmin();
  await ensureSeeded();
  const reviews = (await store.list("reviews")).sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <PageHeader title="Reviews" description="Customer testimonials shown on the homepage (first 3) and the Gallery page." />
      <ReviewManager reviews={reviews} />
    </>
  );
}
