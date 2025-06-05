"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaPlane,
  FaHeart,
  FaRobot,
} from "react-icons/fa";
import { AIRequest, generateTrip } from "../../(public)/api/generate_trip";
import { getCookie } from "cookies-next";
import { useData } from "@/context/DataContext";

export default function AITripPlanner() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setData } = useData();
  const [formData, setFormData] = useState<{
    departure: string;
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    budget: string;
    travelStyle: string;
    interests: string[];
    accommodation: string;
    transportation: string;
  }>({
    departure: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    budget: "",
    travelStyle: "",
    interests: [],
    accommodation: "",
    transportation: "",
  });

  const travelStyles = [
    { id: "budget", label: "Tiết kiệm", icon: "💰" },
    { id: "comfort", label: "Thoải mái", icon: "🏨" },
    { id: "luxury", label: "Sang trọng", icon: "✨" },
    { id: "adventure", label: "Phiêu lưu", icon: "🏔️" },
  ];

  const interestOptions = [
    { id: "culture", label: "Văn hóa", icon: "🏛️" },
    { id: "food", label: "Ẩm thực", icon: "🍜" },
    { id: "nature", label: "Thiên nhiên", icon: "🌿" },
    { id: "beach", label: "Biển", icon: "🏖️" },
    { id: "shopping", label: "Mua sắm", icon: "🛍️" },
    { id: "nightlife", label: "Giải trí", icon: "🌃" },
  ];

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const getDays = (a: string, b: string): number => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    dateA.setHours(0, 0, 0, 0);
    dateB.setHours(0, 0, 0, 0);

    const diffMs = Math.abs(dateB.getTime() - dateA.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays + 1;
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

  const getTransLabel = (trans: string): string => {
    const transMap: { [key: string]: string } = {
      plane: "máy bay",
      car: "ô tô",
      bus: "xe khách",
      train: "tàu hỏa",
      motorbike: "xe máy",
    };
    return transMap[trans] || trans;
  };

  const getTravelStyleLabel = (id: string): string | undefined => {
    return travelStyles.find((style) => style.id === id)?.label;
  };

  const getInterestLabels = (interests: string[]): string[] => {
    return interests.map((interest) => {
      return (
        interestOptions.find((option) => option.id === interest)?.label || ""
      );
    });
  };

  const getAccommodationLabel = (accommodation: string): string | undefined => {
    const accommoMap: { [key: string]: string } = {
      hotel: "khách sạn",
      resort: "resort",
      homestay: "homestay",
      hostel: "hostel",
      villa: "villa",
    };
    return accommoMap[accommodation] || accommodation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.departure || !formData.destination || !formData.startDate || !formData.endDate) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc");
        setIsSubmitting(false);
        return;
      }

      // Calculate days
      const numberOfDays = getDays(formData.endDate, formData.startDate);
      
      // Prepare the trip request with proper data transformation
      const tripRequest: AIRequest = {
        departure: formData.departure.trim(),
        destination: formData.destination.trim(),
        people: formData.travelers,
        days: numberOfDays,
        time: formData.startDate,
        money: getBudgetLabel(formData.budget) || "Chưa xác định",
        transportation: getTransLabel(formData.transportation) || "Chưa xác định",
        travelStyle: getTravelStyleLabel(formData.travelStyle) || "Chưa xác định",
        interests: getInterestLabels(formData.interests),
        accommodation: getAccommodationLabel(formData.accommodation) || "Chưa xác định",
      };

      console.log("Submitting trip request:", tripRequest);

      const token = getCookie("token");
      if (!token) {
        alert("Vui lòng đăng nhập để sử dụng tính năng này");
        router.push("/login");
        return;
      }

      // Call the Gemini AI API through our backend
      const trip = await generateTrip(tripRequest, token as string);
      console.log("Trip generated successfully:", trip);
      
      // Store the trip data in context
      setData(trip);

      // Navigate to suggestions page with query params for display
      const queryParams = new URLSearchParams({
        departure: formData.departure,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: formData.travelers.toString(),
        budget: formData.budget,
        tripId: trip.idAIRec || "",
      });

      router.push(`/trips/suggestions?${queryParams.toString()}`);
    } catch (error) {
      console.error("Error generating trip:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo kế hoạch du lịch";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FaRobot className="text-4xl text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lộ trình AI
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Để AI tạo ra lộ trình du lịch hoàn hảo dành riêng cho bạn
          </p>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Departure */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FaPlane className="mr-2 text-blue-500" />
                    Điểm khởi hành
                  </label>
                  <input
                    type="text"
                    name="departure"
                    value={formData.departure}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Hồ Chí Minh, Hà Nội..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                    required
                  />
                </div>

                {/* Destination */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    Điểm đến
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Đà Lạt, Phú Quốc, Sapa..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                    required
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <FaCalendarAlt className="mr-2 text-green-500" />
                      Ngày đi
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <FaCalendarAlt className="mr-2 text-green-500" />
                      Ngày về
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                      required
                    />
                  </div>
                </div>

                {/* Travelers and Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <FaUsers className="mr-2 text-purple-500" />
                      Số người
                    </label>
                    <input
                      type="number"
                      name="travelers"
                      value={formData.travelers}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <FaDollarSign className="mr-2 text-yellow-500" />
                      Ngân sách (VNĐ)
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                      required
                    >
                      <option value="">Chọn ngân sách</option>
                      <option value="under-5m">Dưới 5 triệu</option>
                      <option value="5m-10m">5 - 10 triệu</option>
                      <option value="10m-20m">10 - 20 triệu</option>
                      <option value="20m-50m">20 - 50 triệu</option>
                      <option value="over-50m">Trên 50 triệu</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Travel Style */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-4">
                    <FaHeart className="mr-2 text-pink-500" />
                    Phong cách du lịch
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {travelStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            travelStyle: style.id,
                          }))
                        }
                        className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          formData.travelStyle === style.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">{style.icon}</div>
                        <div className="text-sm font-medium">{style.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-4">
                    <FaHeart className="mr-2 text-pink-500" />
                    Sở thích (chọn nhiều)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => handleInterestToggle(interest.id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          formData.interests.includes(interest.id)
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="text-lg mb-1">{interest.icon}</div>
                        <div className="text-xs font-medium">
                          {interest.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accommodation & Transportation */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      🏨 Loại chỗ ở
                    </label>
                    <select
                      name="accommodation"
                      value={formData.accommodation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                    >
                      <option value="">Chọn loại chỗ ở</option>
                      <option value="hotel">Khách sạn</option>
                      <option value="resort">Resort</option>
                      <option value="homestay">Homestay</option>
                      <option value="hostel">Hostel</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      🚗 Phương tiện di chuyển
                    </label>
                    <select
                      name="transportation"
                      value={formData.transportation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-blue-300"
                    >
                      <option value="">Chọn phương tiện</option>
                      <option value="plane">Máy bay</option>
                      <option value="car">Ô tô</option>
                      <option value="bus">Xe khách</option>
                      <option value="train">Tàu hỏa</option>
                      <option value="motorbike">Xe máy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    AI đang tạo lộ trình...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaRobot className="mr-3" />
                    Tạo lộ trình AI
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
