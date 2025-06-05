"use client";
import { useRouter } from "next/navigation";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

export default function Farvorites() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col justify-center items-center h-screen bg-white text-black mb-5 p-3">
        <h1 className="text-4xl">This is a favorite page</h1>
        <p className="text-2xl">Nội dung của trang này sẽ được thêm vào sau</p>
        <button
          onClick={handleGoBack}
          className="items-center text-white hover:opacity-70 transition-opacity duration-300 mb-4 bg-red-500 right-0"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
