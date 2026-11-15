import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = (await store.list("categories")).sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <PageHeader title="New product" back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm categories={categories.map(({ id, name }) => ({ id, name }))} />
    </>
  );
}
