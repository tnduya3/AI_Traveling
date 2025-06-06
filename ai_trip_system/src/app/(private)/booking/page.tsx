'use client';

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getCookie } from 'cookies-next';
import { FaCalendarAlt, FaQrcode, FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import Toast from '@/components/Toast'; // Assuming you have a Toast component

function BookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idPlace = searchParams.get('idPlace');
    const namePlace = searchParams.get('namePlace');
    const token = getCookie('token') as string;
    
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'pending' | 'confirmed' | 'canceled'>('pending');
    const [showQR, setShowQR] = useState(false);
    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'info',
    });

    // Create a new hotel booking
    const createBooking = async () => {
        setIsLoading(true);
        try {
            if (!idPlace) {
                throw new Error('Thiếu thông tin địa điểm');
            }

            const response = await fetch(`http://127.0.0.1:8000/api/v1/bookings/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    idPlace: idPlace,
                    date: new Date(selectedDate).toISOString(),
                    status: 'pending'
                })
            });

            if (!response.ok) {
                throw new Error('Có lỗi xảy ra khi đặt chỗ');
            }

            const data = await response.json();
            console.log('Booking created:', data);
            setShowQR(true);
            showToast(
                'Cảm ơn đã sử dụng dịch vụ của chúng tôi!\nVui lòng đợi trong giây lát để bên du lịch xác nhận!',
                'success'
            );
            
            // Simulate status change after some time (for demo purposes)
            setTimeout(() => {
                setBookingStatus('confirmed');
            }, 5000);
            
            return data;
        } catch (error) {
            console.error('Error creating booking:', error);
            showToast('Có lỗi xảy ra khi đặt chỗ. Vui lòng thử lại sau.', 'error');
        } finally {
            setIsLoading(false);
        }
    }

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            visible: true,
            message,
            type
        });

        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="bg-blue-600 text-white rounded-t-xl p-6 shadow-lg">
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                            <FaMapMarkerAlt className="mr-3" />
                            {namePlace || 'Đặt chỗ du lịch'}
                        </h1>
                        <p className="mt-2 opacity-80">ID địa điểm: {idPlace || 'Chưa xác định'}</p>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-b-xl p-6 shadow-lg mb-6 filter drop-shadow-lg backdrop-blur-md">
                        {/* Date Selection */}
                        <div className="mb-6">
                            <label className="text-gray-700 font-semibold mb-2 flex items-center">
                                <FaCalendarAlt className="mr-2 text-blue-500" />
                                Chọn ngày
                            </label>
                            <input
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedDate}
                                onChange={handleDateChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* QR Code Section */}
                        <div className="my-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                <FaQrcode className="mr-2 text-blue-500" />
                                Mã QR thanh toán
                            </h3>
                            
                            {showQR ? (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center">
                                    <div className="w-48 h-48 bg-white p-2 rounded-md shadow-md relative mb-4">
                                        <Image 
                                            src="/images/elementor-placeholder-image.webp"
                                            width={192}
                                            height={192}
                                            className="rounded-md" 
                                            alt="QR Code"  
                                            objectFit="contain"
                                            priority
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 text-center">
                                        Quét mã QR để hoàn tất thanh toán cho đặt chỗ của bạn
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                                    Mã QR sẽ hiển thị sau khi đặt chỗ
                                </div>
                            )}
                        </div>

                        {/* Status Display */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                <FaInfoCircle className="mr-2 text-blue-500" />
                                Trạng thái đặt chỗ
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                        bookingStatus === 'confirmed' ? 'bg-green-500' : 
                                        bookingStatus === 'pending' ? 'bg-yellow-500' : 
                                        'bg-red-500'
                                    }`}></span>
                                    <span className={`font-medium ${
                                        bookingStatus === 'confirmed' ? 'text-green-600' : 
                                        bookingStatus === 'pending' ? 'text-yellow-600' : 
                                        'text-red-600'
                                    }`}>
                                        {bookingStatus === 'confirmed' ? 'Đã xác nhận' : 
                                         bookingStatus === 'pending' ? 'Đang chờ xác nhận' : 
                                         'Đã hủy'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {bookingStatus === 'confirmed' 
                                        ? 'Đặt chỗ của bạn đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!' 
                                        : bookingStatus === 'pending'
                                        ? 'Đặt chỗ của bạn đang chờ xác nhận từ nhà cung cấp dịch vụ.'
                                        : 'Đặt chỗ đã bị hủy. Vui lòng liên hệ với chúng tôi để biết thêm thông tin.'}
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            className={`w-full py-3 rounded-md font-medium text-white shadow-md flex items-center justify-center ${
                                isLoading || showQR ? 'bg-green-900 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            onClick={createBooking}
                            disabled={isLoading || showQR}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : showQR ? (
                                'Đã đặt chỗ thành công'
                            ) : (
                                'Xác nhận đặt chỗ'
                            )}
                        </button>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Thông tin bổ sung</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                                Vui lòng kiểm tra kỹ thông tin trước khi xác nhận đặt chỗ.
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                                Bạn có thể hủy đặt chỗ trước 24 giờ mà không bị tính phí.
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                                Liên hệ với chúng tôi qua hotline 0123456789 nếu cần hỗ trợ.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.visible && (
                <div className={`fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-lg border-l-4 ${
                    toast.type === 'success' ? 'border-green-500' : 
                    toast.type === 'error' ? 'border-red-500' : 'border-blue-500'
                } animate-slide-up`}>
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className={`flex-shrink-0 ${
                                toast.type === 'success' ? 'text-green-500' :
                                toast.type === 'error' ? 'text-red-500' : 'text-blue-500'
                            }`}>
                                {toast.type === 'success' && (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {toast.type === 'error' && (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {toast.type === 'info' && (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800 whitespace-pre-line">
                                    {toast.message}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingPage;