"use client";

import LoginForm from "./loginForm";
import { useSearchParams } from "next/navigation";

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="flex-grow container mx-auto px-4 py-8">
        <LoginForm callbackUrl={callbackUrl} />
      </main>
    </div>
  );
}
