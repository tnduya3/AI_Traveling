"use client";

import { ReactNode } from "react";
import Header from "@/components/header";
import Providers from "@/components/Providers";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Providers>
      <Header />
      <main className="flex-grow pt-[80px]">{children}</main>
    </Providers>
  );
}
