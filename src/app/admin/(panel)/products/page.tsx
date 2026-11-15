import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ensureSeeded } from "@/lib/data";
import { store } from "@/lib/store";
import { PageHeader } from "@/components/admin/ui";
import { ProductTable } from "@/components/admin/product-table";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  await requireAdmin();
  await ensureSeeded();
  const [products, categories] = await Promise.all([store.list("products"), store.list("categories")]);
  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products · ${products.filter((p) => p.visible).length} visible on the website`}
        action={
          <Link href="/admin/products/new" className="btn-primary !py-3">
            <Plus className="size-4" /> Add product
          </Link>
        }
      />
      <ProductTable
        products={products.sort((a, b) => a.sortOrder - b.sortOrder)}
        categories={categories.sort((a, b) => a.sortOrder - b.sortOrder).map(({ id, name }) => ({ id, name }))}
      />
    </>
  );
}
