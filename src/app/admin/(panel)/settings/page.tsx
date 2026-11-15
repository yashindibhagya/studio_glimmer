import { requireAdmin } from "@/lib/auth";
import { readSettings } from "@/lib/data";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await readSettings();
  return (
    <>
      <PageHeader title="Site Settings" description="Contact details, homepage text, announcement bar and policy pages." />
      <SettingsForm settings={settings} />
    </>
  );
}
