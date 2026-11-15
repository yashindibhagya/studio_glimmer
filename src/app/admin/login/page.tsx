import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="bg-ivory border-line w-full max-w-sm rounded-[2rem] border p-8 shadow-[0_30px_60px_-40px_rgb(92_52_34/0.5)]">
        <Image src="/logo.webp" alt="Studio Glimmer" width={170} height={170} priority className="mx-auto -my-4 mix-blend-multiply" />
        <h1 className="font-display text-bronze mt-4 text-center text-3xl">Admin Portal</h1>
        <p className="text-muted mt-1 text-center text-sm">Sign in to manage your shop</p>
        <LoginForm />
      </div>
    </div>
  );
}
