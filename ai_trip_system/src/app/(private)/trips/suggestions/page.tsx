"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaRobot,
  FaArrowLeft,
  FaHeart,
  FaStar,
  FaShare,
  FaCopy,
  FaDownload,
  FaSync,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Carousel from "@/components/carousel";
import { useData } from "@/context/DataContext";
import { aiRecommendationService, TripGenerateRequest } from "@/services/aiRecommendationService";
import { useAuth } from "@/context/AuthContext";

export default function TripSuggestions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState<any>(null);
  const [showInfo, setShowInfo] = useState<boolean[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [recommendationId, setRecommendationId] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { data } = useData();

  const handleClick = (index: number) =>
    setShowInfo((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  const handleOnPlan = () => router.push("/detail");

  // Parse URL parameters and load recommendation data
  useEffect(() => {
    if (searchParams) {
      const tripData = {
        departure: searchParams.get("departure") || "",
        destination: searchParams.get("destination") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        travelers: searchParams.get("travelers") || "1",
        budget: searchParams.get("budget") || "",
        travelStyle: searchParams.get("travelStyle") || "",
        interests: searchParams.get("interests")?.split(",") || [],
        accommodation: searchParams.get("accommodation") || "",
        transportation: searchParams.get("transportation") || "",
      };
      setTripData(tripData);
      // generateAIRecommendation(tripData);

      // Simulate AI processing
    }
  }, [searchParams]);

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const getBudgetLabel = (budget: string) => {
    const budgetMap: { [key: string]: string } = {
      "under-5m": "Dưới 5 triệu",
      "5m-10m": "5 - 10 triệu",
      "10m-20m": "10 - 20 triệu",
      "20m-50m": "20 - 50 triệu",
      "over-50m": "Trên 50 triệu",
    };
    return budgetMap[budget] || budget;
  };

  const generateAIRecommendation = async (tripData: any) => {
    try {
      setIsLoading(true);
      setError("");

      if (!tripData.departure || !tripData.destination) {
        setError("Thiếu thông tin chuyến đi để tạo gợi ý mới");
        return;
      }

      const days = calculateDays(tripData.startDate, tripData.endDate);

      const request: TripGenerateRequest = {
        departure: tripData.departure,
        destination: tripData.destination,
        people: parseInt(tripData.travelers) || 1,
        days: days,
        time: tripData.startDate,
        money: getBudgetLabel(tripData.budget),
        transportation: tripData.transportation,
        travelStyle: tripData.travelStyle,
        interests: tripData.interests,
        accommodation: tripData.accommodation
      };

      const response = await aiRecommendationService.generateTrip(request);

      setAiRecommendation(response.recommendation);
      setRecommendationId(response.idAIRec);

      // Reset saved status for new recommendation
      setIsSaved(false);

    } catch (error) {
      console.error('Error regenerating AI recommendation:', error);
      setError(`Không thể tạo lại gợi ý AI: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize showInfo array when data is loaded
  useEffect(() => {
    // Check if data is TripPlan format (has parameters.days)
    if (data && 'parameters' in data && data.parameters?.days) {
      setShowInfo(Array(data.parameters.days.length).fill(true));
    }

    // If data is TripGenerateResponse format, use the recommendation
    if (data && 'recommendation' in data) {
      setAiRecommendation(data.recommendation);
      setRecommendationId(data.idAIRec);
    }
  }, [data]);

  if (!tripData) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const saveRecommendation = () => {
    if (typeof window !== 'undefined' && recommendationId) {
      const savedRecs = localStorage.getItem('saved_recommendations') || '[]';
      const savedArray = JSON.parse(savedRecs);
      if (!savedArray.includes(recommendationId)) {
        savedArray.push(recommendationId);
        localStorage.setItem('saved_recommendations', JSON.stringify(savedArray));
        setIsSaved(true);
        alert('Đã lưu gợi ý thành công!');
      }
    }
  };

  const shareRecommendation = async () => {
    const shareText = `🤖 Gợi ý du lịch AI từ Explavue!\n\n📍 ${tripData.departure} → ${tripData.destination}\n👥 ${tripData.travelers} người\n⏰ ${formatDate(tripData.startDate)} - ${formatDate(tripData.endDate)}\n\n${aiRecommendation.slice(0, 200)}...\n\n#ExplavueAI #DuLich`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gợi ý du lịch AI từ Explavue',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Đã sao chép link chia sẻ vào clipboard!');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiRecommendation);
      alert('Đã sao chép gợi ý vào clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadAsText = () => {
    const content = `Gợi ý du lịch AI - Explavue

Thông tin chuyến đi:
- Điểm khởi hành: ${tripData.departure}
- Điểm đến: ${tripData.destination}
- Thời gian: ${formatDate(tripData.startDate)} - ${formatDate(tripData.endDate)}
- Số người: ${tripData.travelers}
- Ngân sách: ${getBudgetLabel(tripData.budget)}
- Phong cách: ${tripData.travelStyle}
- Phương tiện: ${tripData.transportation}
- Sở thích: ${tripData.interests?.join(', ') || 'Không có'}

Gợi ý từ AI:
${aiRecommendation}

---
Được tạo bởi Explavue AI
${new Date().toLocaleString('vi-VN')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goi-y-du-lich-${tripData.departure}-${tripData.destination}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const regenerateRecommendation = async () => {
    setIsRegenerating(true);
    await generateAIRecommendation(tripData);
    setIsRegenerating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <FaRobot className="text-6xl text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            AI đang tạo lộ trình...
          </h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error || !aiRecommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <FaRobot className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không thể tải gợi ý
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Không có dữ liệu gợi ý. Vui lòng tạo lại kế hoạch du lịch."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/trips")}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo kế hoạch mới
            </button>
            {tripData && (
              <button
                onClick={() => regenerateRecommendation()}
                disabled={isRegenerating}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isRegenerating ? "Đang tạo lại..." : "Thử tạo lại"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại
          </button>
          <div>
            {/* <h1 className="text-3xl font-bold text-gray-800">
              Gợi ý lộ trình AI
            </h1> */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 drop-shadow-sm leading-relaxed"
            >
              Gợi ý lộ trình du lịch
            </motion.h1>
            <p className="text-gray-600">Dựa trên thông tin bạn đã cung cấp</p>
          </div>
        </div>
        {/* Trip Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-600" />
            Thông tin chuyến đi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-red-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Hành trình</p>
                <p className="font-semibold">
                  {tripData.departure} → {tripData.destination}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="font-semibold">
                  {formatDate(tripData.startDate)} -{" "}
                  {formatDate(tripData.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <FaUsers className="text-purple-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Số người</p>
                <p className="font-semibold">{tripData.travelers} người</p>
              </div>
            </div>
          </div>
        </div>
        {/* Days Suggestions - Only show if we have TripPlan data with structured days */}
        {data && 'parameters' in data && data.parameters?.days && data.parameters.days.map((day: any, i: number) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-5"
          >
            <motion.div
              className="cursor-pointer text-center mb-6"
              onClick={() => handleClick(i)}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-semibold text-blue-600 hover:underline">
                {`Ngày ${i + 1} (${formatDate(day.date)})`}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: showInfo[i] ? 1 : 0,
                height: showInfo[i] ? "auto" : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Carousel activities={day.activities} />
            </motion.div>
          </div>
        ))}
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
        {/* AI Suggestions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <FaRobot className="text-4xl text-blue-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-800">
              Gợi ý từ AI
            </h2>
          </div>

          {/* {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => tripData && generateAIRecommendation(tripData)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Thử lại
              </button>
            </div>
          ) : aiRecommendation ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {aiRecommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <p className="text-gray-600 text-center">
                Chưa có gợi ý từ AI. Hãy thử tạo lại hoặc kiểm tra kết nối.
              </p>
            </div>
          )} */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {aiRecommendation}
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push("/trips")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Tạo lộ trình mới
            </button>
            <button
              onClick={() => router.push("/home")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
            >
              Về trang chủ
            </button>
          </div>

          {/* AI Recommendation Actions */}
          {aiRecommendation && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Hành động với gợi ý AI</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  onClick={saveRecommendation}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${isSaved
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  disabled={isSaved}
                >
                  <FaHeart className="text-lg" />
                  <span className="hidden sm:inline">{isSaved ? "Đã lưu" : "Lưu"}</span>
                </button>
                <button
                  onClick={shareRecommendation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-blue-700"
                >
                  <FaShare className="text-lg" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-yellow-200"
                >
                  <FaCopy className="text-lg" />
                  <span className="hidden sm:inline">Sao chép</span>
                </button>
                <button
                  onClick={downloadAsText}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:bg-gray-700"
                >
                  <FaDownload className="text-lg" />
                  <span className="hidden sm:inline">Tải về</span>
                </button>
                <button
                  onClick={regenerateRecommendation}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${isRegenerating
                      ? "bg-red-500 text-white cursor-not-allowed"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <>
                      <FaSync className="text-lg animate-spin" />
                      <span className="hidden sm:inline">Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <FaSync className="text-lg" />
                      <span className="hidden sm:inline">Tạo lại</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
