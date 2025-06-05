'use client';

import Image from 'next/image';
import { FaWifi, FaCoffee, FaConciergeBell, FaStar, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle, FaHourglass, FaTimes } from 'react-icons/fa';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { getCookie } from 'cookies-next';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

interface BookingCardProps {
  idBooking: string;
  idPlace: number;
  status: string;
  date: string;
  placeName?: string;
  placeImage?: string;
}

interface UserInfo {
  idUser: string;
  name: string;
  username: string;
  gender: boolean;
  email: string;
  phoneNumber?: string
}

export default function BookingCard({
  idBooking
}: {
  idBooking: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const token = getCookie('token');
  const [data, setData] = useState<BookingCardProps | null>(null);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [editableBookingData, setEditableBookingData] = useState<BookingCardProps | null>(null);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/bookings?idBooking=${idBooking}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`API error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    setLoadingUser(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/bookings/${idBooking}/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const userData = await response.json();
      setUserInfo(Array.isArray(userData) && userData.length > 0 ? userData[0] : null);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [idBooking]);

  useEffect(() => {
    if (data) {
      setEditableBookingData(data);
    }
  }, [data]);

  const handleViewUserInfo = () => {
    setShowUserModal(true);
    if (!userInfo && !loadingUser) {
      fetchUserInfo();
    }
  };

  const handleSaveBookingChanges = async () => {
    if (!editableBookingData) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/bookings/?idBooking=${idBooking}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          idPlace: editableBookingData.idPlace,
          date: editableBookingData.date,
          status: editableBookingData.status
        })
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const updatedData = await response.json();
      setData(updatedData);
      setIsEditingBooking(false);
    } catch (error) {
      showToast(`Lỗi khi lưu thay đổi: ${error}`, 'error');
    } finally {
      setIsLoading(false);
      showToast('Thay đổi đã được lưu thành công!', 'success');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có thông tin';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md mx-auto">
        <Loading message="Đang tải thông tin đặt chỗ..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md mx-auto">
        <p className="text-center text-gray-600">Không tìm thấy thông tin đặt chỗ</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md filter backdrop-blur-sm p-4 overflow-hidden w-full md:w-4/5 mx-auto">
      {/* Content section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-sky-700">
            {data.placeName || `Địa điểm #${data.idPlace}`}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.status === "CONFIRMED" ? 'bg-green-100 text-green-800' :
            data.status === "PENDING" ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
            {data.status === "CONFIRMED" ? 'CONFIRMED' :
              data.status === "PENDING" ? 'PENDING' : 'CANCELED'}
          </span>
        </div>

        <div className="flex items-center text-gray-700 mb-1">
          <FaMapMarkerAlt className="mr-2 text-sky-600" />
          <span className="text-sm">Địa điểm ID: {data.idPlace}</span>
        </div>

        <div className="flex items-center text-gray-700 mb-1">
          <FaCalendarAlt className="mr-2 text-sky-600" />
          <span className="text-sm">
            {data.date ? formatDate(data.date) : 'Chưa có thông tin ngày'}
          </span>
        </div>

        <div className="flex items-center text-gray-700 mb-4">
          <span className="text-sm font-medium mr-2">Mã đặt chỗ:</span>
          <span className="text-sm font-bold">{data.idBooking}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center px-3 py-1 bg-sky-50 text-sky-700 rounded-md border border-sky-200">
            <FaWifi className="mr-2" />
            <span className="text-xs font-medium">Wifi miễn phí</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-sky-50 text-sky-700 rounded-md border border-sky-200">
            <FaCoffee className="mr-2" />
            <span className="text-xs font-medium">Bữa sáng</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-sky-50 text-sky-700 rounded-md border border-sky-200">
            <FaConciergeBell className="mr-2" />
            <span className="text-xs font-medium">Dịch vụ phòng</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center">
          {data.status === "CONFIRMED" ? (
            <>
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-sm text-green-600">Đã xác nhận đặt chỗ của bạn</span>
            </>
          ) : data.status === "PENDING" ? (
            <>
              <FaHourglass className="text-yellow-500 mr-2" />
              <span className="text-sm text-yellow-600">Đang chờ xác nhận</span>
            </>
          ) : (
            <>
              <FaTimes className="text-red-500 mr-2" />
              <span className="text-sm text-red-600">Đặt chỗ đã bị hủy</span>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 flex flex-wrap gap-2">
          <button
            className="w-full sm:w-auto flex-grow sm:flex-grow-0 px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition duration-200 text-sm font-medium"
            onClick={handleViewUserInfo}
          >
            Xem thông tin người đặt
          </button>
          <button
            className="w-full sm:w-auto flex-grow sm:flex-grow-0 px-5 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200 text-sm font-medium"
            onClick={() => setIsEditingBooking(true)}
          >
            Chỉnh sửa
          </button>
        </div>

      </div>

      {/* Modal thông tin người dùng */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Thông tin người đặt"
        size="md"
      >
        {loadingUser ? (
          <div className="flex justify-center p-4">
            <Loading message="Đang tải thông tin người dùng..." />
          </div>
        ) : userInfo ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-6 mb-4">
              <p className="font-medium">{userInfo.name || 'Không có thông tin'}</p>
              <p className="text-sm text-gray-500">{userInfo.username || 'Không có thông tin'}</p>
              <p className="text-sm text-gray-500">{userInfo.gender ? 'Nam' : 'Nữ'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userInfo.email || 'Không có thông tin'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p className="font-medium">{userInfo.phoneNumber || 'Không có thông tin'}</p>
            </div>


            <button
              className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200"
              onClick={() => setShowUserModal(false)}
            >
              Đóng
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">Không thể tải thông tin người dùng</p>
            <button
              className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition duration-200"
              onClick={fetchUserInfo}
            >
              Thử lại
            </button>
          </div>
        )}
      </Modal>

      {/* Modal chỉnh sửa booking */}
      <Modal
        isOpen={isEditingBooking}
        onClose={() => setIsEditingBooking(false)}
        title="Chỉnh sửa đặt chỗ"
        size="md"
      >
        {!editableBookingData ? (
          <div className="flex justify-center p-4">
            <Loading message="Đang tải..." />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Ngày đặt</label>
              <input
                type="datetime-local"
                value={editableBookingData.date ? new Date(editableBookingData.date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditableBookingData({ ...editableBookingData, date: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">ID Địa điểm</label>
              <input
                type="text"
                value={editableBookingData.idPlace}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setEditableBookingData({ ...editableBookingData, idPlace: value });
                }}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                className="flex-1 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition duration-200"
                onClick={handleSaveBookingChanges}
              >
                Lưu thay đổi
              </button>
              <button
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition duration-200"
                onClick={() => {
                  setIsEditingBooking(false);
                  setEditableBookingData(data);
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  );
}