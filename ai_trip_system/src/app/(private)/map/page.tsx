// src/app/map/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FaUtensils,
  FaHotel,
  FaLandmark,
  FaRoute,
  FaSearch,
  FaUmbrellaBeach,
} from "react-icons/fa";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function MapPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Trạng thái menu mở rộng
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Đóng menu khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-0.5 py-2 w-full">
        <h1 className="text-2xl font-bold text-blue-900 mb-6 mt-3">Bản đồ</h1>
        <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-0">
          {/* Nhóm thanh tìm kiếm và nút Lộ trình */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto flex-grow">
            {/* Thanh tìm kiếm */}
            <form className="relative flex-grow w-full md:w-auto">
              <input
                type="text"
                placeholder="Tìm kiếm trên bản đồ"
                className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              {/* Nút tìm kiếm */}
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
              >
                <FaSearch className="w-5 h-5 mr-2" />
              </button>
            </form>

            {/* Nút Lộ trình */}
            <button className="flex items-center px-3 py-2 bg-teal-500 hover:bg-teal-700 text-white rounded-lg transition-colors duration-300 text-center gap-2">
              <FaRoute />
              <span className="text-sm">Lộ trình</span>
            </button>
          </div>

          {/* 4 nút trên máy tính */}
          <div className="hidden md:flex flex-wrap justify-end gap-2">
            <button className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300">
              <FaUtensils className="w-5 h-5 mr-2" />
              <span className="text-sm">Nhà hàng</span>
            </button>
            <button className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300">
              <FaHotel className="w-5 h-5 mr-2" />
              <span className="text-sm">Khách sạn</span>
            </button>
            <button className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300">
              <FaUmbrellaBeach className="w-5 h-5 mr-2" />
              <span className="text-sm">Đi chơi</span>
            </button>
            <button className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300">
              <FaLandmark className="w-5 h-5 mr-2" />
              <span className="text-sm">Tham quan</span>
            </button>
          </div>

          {/* Nút menu trên mobile */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300"
              aria-label="Mở menu danh mục"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <div
              className={`absolute top-12 right-0 bg-white min-w-[160px] shadow-lg rounded-lg z-10 transition-all duration-300 transform -translate-y-2 ${
                isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 hidden"
              }`}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  <FaUtensils className="w-5 h-5 mr-2" />
                  Nhà hàng
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FaHotel className="w-5 h-5 mr-2" />
                  Khách sạn
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FaUmbrellaBeach className="w-5 h-5 mr-2" />
                  Đi chơi
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
                >
                  <FaLandmark className="w-5 h-5 mr-2" />
                  Tham quan
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <MapView />
        </div>
      </main>
    </div>
  );
}
