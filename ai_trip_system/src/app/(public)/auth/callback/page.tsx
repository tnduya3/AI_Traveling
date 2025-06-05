"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("access_token");
      const callbackUrl = localStorage.getItem("google_callback") || "/home";

      if (token) {
        login(token);

        const profileRes = await fetch(`/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          localStorage.setItem("current_user_id", profileData.userId);
        }

        if (callbackUrl) {
          localStorage.removeItem("google_callback");
          router.push(callbackUrl);
        }

        router.push("/home");
      } else {
        router.push("/login");
      }

      setLoading(false);
    }

    handleCallback();
  }, [login, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Đang xử lý đăng nhập với Google...</p>
        </div>
      ) : null}
    </div>
  );
}
