"use client";
import Header from "@/components/header";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import Loading from "@/components/Loading";
import { DataProvider } from "@/context/DataContext";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthCheck();
  if (loading) return <Loading message="Đang kiểm tra đăng nhập..." />;

  return (
    <DataProvider>
      <Header />
      {children}
    </DataProvider>
  );
}
