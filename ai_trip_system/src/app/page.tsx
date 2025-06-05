"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import IntroPage from "./(public)/intro/page";

// Main page with auth check
export default function HomePage() {
  const router = useRouter();

  // Redirect to home if logged in
  useEffect(() => {
    // Check localStorage directly for immediate decision
    const isUserLoggedIn =
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedIn") === "true";

    if (isUserLoggedIn) {
      router.replace("/home");
    }
  }, [router]);

  // Show intro page while checking or if not logged in
  return <IntroPage />;
}
