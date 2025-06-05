'use client';

// import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    // <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    // </SessionProvider>
  );
}
