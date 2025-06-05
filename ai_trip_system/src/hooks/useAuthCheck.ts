"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCookie } from "cookies-next";

export function useAuthCheck(redirectTo: string = "/login") {
  const [user, setUser] = useState<{ userId: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const check = async () => {
      const token = getCookie("token");

      if (!token) {
        router.push(
          `${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`
        );
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push(
            `${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`
          );
        }
      } catch {
        router.push(
          `${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`
        );
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [router, redirectTo, pathname]);

  return { user, loading };
}
