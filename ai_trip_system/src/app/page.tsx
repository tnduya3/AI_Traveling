"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import IntroPage from "./(public)/intro/page";
import { getCookie } from "cookies-next"; // Import getCookie if using cookies
import { toast } from 'react-toastify'; // Import toast if using react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import styles

// Main page with auth check
export default function HomePage() {
  const router = useRouter();

  // Redirect to home if logged in
  useEffect(() => {
    // Check localStorage directly for immediate decision
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const token = getCookie("token");

    if (isLoggedIn && token && typeof token === 'string') {
      const expiryTime = new Date(token).getTime();
      const now = new Date().getTime();

      if (now > expiryTime) {
        // Token has expired
        localStorage.removeItem("isLoggedIn");
        toast.error("Your session has expired. Please log in again."); // Show toast
        router.replace("/login"); // Redirect to login page
      } else {
        router.replace("/home");
      }
    }
  }, [router]);

  // Show intro page while checking or if not logged in
  return <IntroPage />;
}
