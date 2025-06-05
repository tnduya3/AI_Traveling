"use client";
import Carousel from "@/components/carousel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Result = () => {
  const [showInfo, setShowInfo] = useState(true);
  const router = useRouter();

  const handleClick = () => setShowInfo((prev) => !prev);
  const handleOnPlan = () => router.push("/detail");

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 drop-shadow-sm leading-relaxed"
      >
        Gợi ý lộ trình du lịch
      </motion.h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <motion.div
          className="cursor-pointer text-center mb-6"
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-2xl font-semibold text-blue-600 hover:underline">
            Ngày 1 (13/4/2025)
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: showInfo ? 1 : 0, height: showInfo ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Carousel quantity={10} />
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {[
          { label: "Lên kế hoạch", color: "green", onClick: handleOnPlan },
          { label: "Chỉnh sửa", color: "yellow" },
          { label: "Kết quả khác", color: "red" },
          { label: "Chia sẻ", color: "cyan" },
        ].map(({ label, color, onClick }) => (
          <motion.button
            key={label}
            onClick={onClick}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            className={`border-2 border-${color}-500 text-${color}-600 hover:bg-${color}-500 hover:text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200`}
          >
            {label}
          </motion.button>
        ))}
      </motion.div>
    </main>
  );
};

export default Result;
