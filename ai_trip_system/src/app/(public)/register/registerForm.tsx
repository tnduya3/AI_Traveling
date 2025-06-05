"use client";

import { useState, FormEvent, useEffect } from "react";
import Loading from "@/components/Loading";
import Link from "next/link";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaGoogle } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    gender: "0", // Default value
    phoneNumber: "",
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialRegister, setIsSocialRegister] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Kiểm tra nếu đến từ social login
  useEffect(() => {
    const source = searchParams.get('source');
    
    if (source === 'google') {
      setIsSocialRegister(true);
      
      try {
        // Lấy dữ liệu từ localStorage
        const socialDataString = localStorage.getItem('socialProfileData');
        if (socialDataString) {
          const socialData = JSON.parse(socialDataString);
          
          // Điền trước thông tin vào form
          setFormData(prev => ({
            ...prev,
            username: socialData.email || prev.username,
            name: socialData.name || prev.name,
            email: socialData.email || prev.email,
            // Tạo mật khẩu ngẫu nhiên nếu đăng ký qua social
            password: Math.random().toString(36).slice(-10),
            confirmPassword: Math.random().toString(36).slice(-10)
          }));
        }
      } catch (err) {
        console.error("Error loading social profile data:", err);
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form (giảm yêu cầu mật khẩu nếu là social register)
    if (!formData.username || (!isSocialRegister && (!formData.password || !formData.confirmPassword)) || !formData.name) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    if (!isSocialRegister) {
      if (formData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu không khớp. Vui lòng kiểm tra lại.");
        return;
      }
    }

    // Validate email format if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Email không hợp lệ.");
      return;
    }

    // Validate phone number if provided
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      setError("Số điện thoại phải có 10 chữ số.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Construct URL with all required params
      const url = new URL("http://127.0.0.1:8000/api/v1/register");
      url.searchParams.append("username", formData.username);
      url.searchParams.append("password", formData.password);
      url.searchParams.append("name", formData.name);
      
      // Add optional params if they exist
      if (formData.email) url.searchParams.append("email", formData.email);
      if (formData.gender) url.searchParams.append("gender", formData.gender);
      if (formData.phoneNumber) url.searchParams.append("phoneNumber", formData.phoneNumber);
      
      // Thêm source nếu từ social login
      if (isSocialRegister) {
        url.searchParams.append("social_source", "google");
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error details:", errorData);
        throw new Error(
          `Đăng ký thất bại! (${response.status}): ${
            errorData.detail || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Registration successful:", data);
      
      // Xóa dữ liệu social profile sau khi đăng ký thành công
      if (isSocialRegister) {
        localStorage.removeItem('socialProfileData');
      }

      // Chuyển hướng người dùng đến trang đăng nhập
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="w-full max-w-md my-4">
        <div className="rounded-2xl shadow-xl filter backdrop-blur-md bg-[rgba(0, 0, 0, 0.1)] p-4 sm:p-6 md:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.236L20 9l-8 4-8-4 8-4.764zM4 9.618v6L12 20l8-4.382v-6L12 14 4 9.618z" />
              </svg>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {isSocialRegister 
                ? "Hoàn tất đăng ký tài khoản 👋" 
                : "Đăng ký tài khoản mới 👋"}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {isSocialRegister
                ? "Chỉ một bước nữa để hoàn tất đăng ký từ Google!"
                : "Tham gia cùng EXPLAVUE ngay hôm nay!"}
            </p>
            {isSocialRegister && (
              <div className="mt-2 inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                <FaGoogle className="mr-1" /> Đăng ký từ Google
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Nhập họ và tên của bạn"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <FaUser />
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Tên đăng nhập <span className="text-red-500">*</span>
                {isSocialRegister && (
                  <span className="text-xs text-gray-500 ml-1">(Email Google của bạn)</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Nhập tên đăng nhập của bạn"
                  required
                  disabled={isLoading || isSocialRegister} // Disable if social register
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <FaUser />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Email
                {isSocialRegister && (
                  <span className="text-xs text-gray-500 ml-1">(Từ tài khoản Google)</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Nhập địa chỉ email của bạn"
                  disabled={isLoading || isSocialRegister} // Disable if social register
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <FaEnvelope />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Số điện thoại
              </label>
              <div className="relative">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Nhập số điện thoại của bạn"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <FaPhone />
                </div>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Giới tính
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={isLoading}
              >
                <option value="0">Không xác định</option>
                <option value="1">Nam</option>
                <option value="2">Nữ</option>
                <option value="3">Khác</option>
              </select>
            </div>

            {/* Password - Ẩn khi đăng ký từ Google */}
            {!isSocialRegister && (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Tạo mật khẩu mới"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <FaLock />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Nhập lại mật khẩu"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <FaLock />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-cyan-500 text-white py-3 px-4 rounded-xl hover:bg-cyan-600 transition duration-200 font-medium mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loading message="Đang xử lý..." />
              ) : isSocialRegister ? (
                "Hoàn tất đăng ký"
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          {!isSocialRegister && (
            <div className="mt-6">
              <Link href="/login">
                <button
                  type="button"
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
                      fill="#4285F4"
                    />
                  </svg>
                  Đăng ký với Google
                </button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Bạn đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-cyan-600 font-medium hover:text-cyan-500"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
