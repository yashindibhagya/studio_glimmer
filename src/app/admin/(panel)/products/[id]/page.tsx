import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([store.get("products", id), store.list("categories")]);
  if (!product) notFound();
  return (
    <>
      <PageHeader title={product.name} back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm
        key={product.id}
        product={product}
        categories={categories.sort((a, b) => a.sortOrder - b.sortOrder).map(({ id, name }) => ({ id, name }))}
      />
    </>
  );
}
