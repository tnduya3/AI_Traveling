"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MapEx from "./Map_Ex";
import PlaceCard from "./PlaceCard";
import { FaList, FaMap, FaStar, FaMapMarkerAlt, FaCompass } from "react-icons/fa";
import { getCookie } from "cookies-next";

interface Place {
  name: string;
  country: string;
  city: string;
  province: string;
  address: string;
  description: string;
  image: string;
  rating: number;
  idPlace: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPlaces, setShowPlaces] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  // If not logged in, don't render the content
  if (!isLoggedIn) {
    return null;
  }

  const normalizePovinceName = (province: string): string => {
    // Convert to lowercase for case-insensitive comparison
    const lowerProvince = province.toLowerCase();

    // Remove common prefixes
    let normalized = lowerProvince
      .replace(/^tỉnh\s+/i, '')    // Remove "tỉnh" prefix
      .replace(/^thành phố\s+/i, '')  // Remove "thành phố" prefix
      .replace(/^tp\.\s*/i, '')    // Remove "tp." prefix
      .trim();

    // Optional: Map to standard names if needed
    const provinceMap: Record<string, string> = {
      'quảng nam': 'Quảng Nam',
      'quảng ninh': 'Quảng Ninh',
      // Add more mappings as needed
    };

    return provinceMap[normalized] || province;
  };

  const fetchPlacesByProvince = async (province: string) => {
    setLoading(true);
    const normalizedProvince = normalizePovinceName(province);
    console.log(`Original: ${province}, Normalized: ${normalizedProvince}`);

    const token = getCookie("token");
    try {
      // Gọi API để lấy danh sách địa điểm theo tỉnh
      const response = await fetch(`http://127.0.0.1:8000/api/v1/places/province?lookup=${encodeURIComponent(normalizedProvince)}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlaces(data);
        setShowPlaces(true);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    fetchPlacesByProvince(province);
  };

  const handleBackToMap = () => {
    setShowPlaces(false);
    setSelectedProvince(null);
    setPlaces([]);
  };

  const handlePlaceClick = () => {
    router.push(`/detail?idPlace=${places[0].idPlace}`);
  };

  return (
    <div className="h-screen flex flex-col m-3 rounded-2xl shadow-xl filter backdrop-blur-md bg-[rgba(0, 0, 0, 0.1)] border-2 border-cyan-950">
      {/* Header */}
      <div className="shadow-xl filter rounded-tr-2xl rounded-tl-2xl backdrop-blur-md bg-gradient-to-l from-indigo-200 to-blue-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaCompass className="w-6 h-6 text-gray-800 animate-pulse" />
          <h2 className="text-xl font-semibold text-shadow-cyan-200">Khám phá địa điểm</h2>
        </div>

        {showPlaces && (
          <button
            onClick={handleBackToMap}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <FaMap className="w-4 h-4" />
            <span>Quay lại bản đồ</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex " >
        {/* Map Section */}
        <div className={`transition-all duration-300 ${showPlaces ? "w-2/3" : "w-full"
          }`}>
          <MapEx
            onProvinceSelect={handleProvinceSelect}
            className="h-full overflow-hidden rounded-2xl shadow-lg"
          />
        </div>

        {/* Places List Section */}
        {showPlaces && (
          <div className="w-1/3 rounded-br-2xl shadow-lg filter backdrop-blur-md bg-[rgba(0, 0, 0, 0.2)] border-l overflow-hidden flex flex-col">
            {/* Places Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Địa điểm tại {selectedProvince}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {places.length} địa điểm được tìm thấy
                  </p>
                </div>
                <FaList className="w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Places List */}
            <div className="flex-1 overflow-y-auto filter backdrop-blur-3xl relative scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-gray-200 scroll-smooth">
              {/* Fade effect at top */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : places.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <FaMapMarkerAlt className="w-8 h-8 mb-2" />
                  <p>Không tìm thấy địa điểm nào</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {places.map((place, index) => (
                    <div
                      key={place.idPlace}
                      className="transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.5s ease forwards'
                      }}
                    >
                      <PlaceCard place={place} />
                    </div>
                  ))}
                </div>
              )}

              {/* Fade effect at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
