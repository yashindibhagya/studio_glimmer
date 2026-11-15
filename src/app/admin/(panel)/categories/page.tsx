import { requireAdmin } from "@/lib/auth";
import { ensureSeeded } from "@/lib/data";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin();
  await ensureSeeded();
  const [categories, products] = await Promise.all([store.list("categories"), store.list("products")]);
  const counts = Object.fromEntries(categories.map((c) => [c.id, products.filter((p) => p.categoryId === c.id).length]));
  return (
    <>
      <PageHeader title="Categories" description="Shown in the menu, on the homepage and as shop filters." />
      <CategoryManager categories={categories.sort((a, b) => a.sortOrder - b.sortOrder)} counts={counts} />
    </>
  );
}
