"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaRobot, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTrash, FaArrowLeft, FaHeart, FaShare, FaCopy, FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";
import { aiRecommendationService } from "@/services/aiRecommendationService";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";

interface AIRecommendation {
  idAIRec: string;
  input: string;
  output: string;
  idUser: string;
  isFavorite?: boolean;
}

export default function AIRecommendationsHistory() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUserId = localStorage.getItem("current_user_id");
      if (currentUserId) {
        setUserId(currentUserId);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchRecommendations();
      // Load favorite IDs from localStorage
      const savedFavorites = localStorage.getItem(`favorites_${userId}`);
      if (savedFavorites) {
        setFavoriteIds(new Set(JSON.parse(savedFavorites)));
      }
    }
  }, [isLoggedIn, userId]);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await aiRecommendationService.getUserRecommendations(userId);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(`Không thể tải lịch sử gợi ý: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const parseInput = (input: string) => {
    // Parse input string to extract information
    const parts = input.split(', ');
    const data: { [key: string]: string } = {};
    
    parts.forEach(part => {
      const [key, value] = part.split(': ');
      if (key && value) {
        data[key] = value;
      }
    });
    
    return data;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const toggleFavorite = (recId: string) => {
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(recId)) {
      newFavorites.delete(recId);
    } else {
      newFavorites.add(recId);
    }
    setFavoriteIds(newFavorites);
    
    // Save to localStorage
    if (userId) {
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(Array.from(newFavorites)));
    }
  };

  const shareRecommendation = async (recommendation: AIRecommendation) => {
    const inputData = parseInput(recommendation.input);
    const shareText = `🤖 Gợi ý du lịch AI từ Explavue!\n\n📍 ${inputData.Departure} → ${inputData.Destination}\n👥 ${inputData.People} người | 📅 ${inputData.Days} ngày\n💰 ${inputData.Budget}\n\n${recommendation.output.slice(0, 200)}...\n\n#ExplavueAI #DuLich`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gợi ý du lịch AI',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Đã sao chép nội dung vào clipboard!');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Đã sao chép gợi ý vào clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadAsText = (recommendation: AIRecommendation) => {
    const inputData = parseInput(recommendation.input);
    const content = `Gợi ý du lịch AI - Explavue
    
Thông tin chuyến đi:
- Điểm khởi hành: ${inputData.Departure}
- Điểm đến: ${inputData.Destination}
- Số người: ${inputData.People}
- Số ngày: ${inputData.Days}
- Ngân sách: ${inputData.Budget}
- Phong cách: ${inputData.Style}
- Phương tiện: ${inputData.Transportation}
- Sở thích: ${inputData.Interests}

Gợi ý từ AI:
${recommendation.output}

---
Được tạo bởi Explavue AI
ID: ${recommendation.idAIRec}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goi-y-du-lich-${inputData.Departure}-${inputData.Destination}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loading message="Đang tải lịch sử gợi ý..." />
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
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-800 flex items-center"
            >
              <FaRobot className="mr-3 text-blue-600" />
              Lịch sử gợi ý AI
            </motion.h1>
            <p className="text-gray-600">Xem lại các gợi ý du lịch từ AI</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Thử lại
            </button>
          </div>
        )}

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <FaRobot className="text-6xl text-gray-400 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              Chưa có gợi ý nào
            </h2>
            <p className="text-gray-500 mb-6">
              Bạn chưa tạo gợi ý du lịch nào từ AI. Hãy bắt đầu tạo chuyến đi đầu tiên!
            </p>
            <button
              onClick={() => router.push("/trips")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Tạo gợi ý mới
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((recommendation, index) => {
              const inputData = parseInput(recommendation.input);
              
              return (
                <motion.div
                  key={recommendation.idAIRec}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
                >
                  {/* Trip Info Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-blue-600">
                        <FaMapMarkerAlt className="mr-2" />
                        <span className="font-semibold">
                          {inputData.Departure} → {inputData.Destination}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaUsers className="mr-1" />
                        <span>{inputData.People} người</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-1" />
                        <span>{inputData.Days} ngày</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      ID: {recommendation.idAIRec}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Ngân sách</p>
                      <p className="font-medium">{inputData.Budget || 'Không xác định'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phong cách</p>
                      <p className="font-medium">{inputData.Style || 'Không xác định'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phương tiện</p>
                      <p className="font-medium">{inputData.Transportation || 'Không xác định'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sở thích</p>
                      <p className="font-medium text-sm">{inputData.Interests || 'Không có'}</p>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FaRobot className="mr-2 text-blue-600" />
                      Gợi ý từ AI
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                        {recommendation.output}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        // Create new trip based on this recommendation
                        const searchParams = new URLSearchParams({
                          departure: inputData.Departure || '',
                          destination: inputData.Destination || '',
                          travelers: inputData.People || '1',
                          budget: inputData.Budget || '',
                          travelStyle: inputData.Style || '',
                          transportation: inputData.Transportation || '',
                          interests: inputData.Interests || ''
                        });
                        router.push(`/trips?${searchParams.toString()}`);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Tạo lại chuyến đi này
                    </button>
                    
                    <span className="text-xs text-gray-400">
                      {inputData.Time ? formatDate(inputData.Time) : 'Không có ngày'}
                    </span>
                  </div>

                  {/* Favorite, Share, Copy, Download Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => toggleFavorite(recommendation.idAIRec)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${favoriteIds.has(recommendation.idAIRec) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <FaHeart className="mr-2" />
                      {favoriteIds.has(recommendation.idAIRec) ? 'Bỏ yêu thích' : 'Yêu thích'}
                    </button>
                    <button
                      onClick={() => shareRecommendation(recommendation)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <FaShare className="mr-2" />
                      Chia sẻ
                    </button>
                    <button
                      onClick={() => copyToClipboard(recommendation.output)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <FaCopy className="mr-2" />
                      Sao chép
                    </button>
                    <button
                      onClick={() => downloadAsText(recommendation)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <FaDownload className="mr-2" />
                      Tải về
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {recommendations.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.push("/trips")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Tạo gợi ý mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
