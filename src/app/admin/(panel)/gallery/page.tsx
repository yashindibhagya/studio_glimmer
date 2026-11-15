import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  await requireAdmin();
  const items = (await store.list("gallery")).sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <PageHeader title="Gallery" description="Photos of finished pieces. Shown on the Gallery page and the homepage." />
      <GalleryManager items={items} />
    </>
  );
}
