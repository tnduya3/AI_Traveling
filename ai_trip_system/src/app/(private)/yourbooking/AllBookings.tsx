'use client'

import BookingCard from "./Card";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { getCookie } from "cookies-next";
import Filter, { FilterOptions } from './Filter';
import Loading from "@/components/Loading";
import useScrollReveal from "@/hooks/useScrollReveal";

interface Booking {
    idBooking: string;
}

function BookingCardReveal({ idBooking, index }: { idBooking: string; index: number }) {
    const [ref, isVisible] = useScrollReveal();
    return (
        <div
            ref={ref}
            className={`transition-transform duration-500 ease-in-out will-change-transform ${isVisible ? "animate-fadeInUp opacity-100" : "opacity-0 translate-y-8"}`}
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
        >
            <BookingCard idBooking={idBooking} />
        </div>
    );
}

export default function AllBookings() {
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const token = getCookie("token");
    const fetchBookings = async (filters: FilterOptions) => {
        setIsLoading(true);

        try {
            let url = 'http://127.0.0.1:8000/api/v1/bookings/';

            // Nếu có filter
            if (filters.select !== 'all' && filters.lookup) {
                url = `http://127.0.0.1:8000/api/v1/bookings/${filters.select}?lookup=${encodeURIComponent(filters.lookup)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setBookings(data);
        } catch (err) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings({ select: 'all', lookup: '' });
    }, []);

    const handleFilterChange = (filters: FilterOptions) => {
        fetchBookings(filters);
    };

    return (
        <div className="space-y-4">
            <Filter onFilterChange={handleFilterChange} />

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loading message="Đang tải dữ liệu đặt chỗ..." />
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white p-6 rounded-lg text-gray-500 text-center border border-gray-200 shadow-sm">
                    <p>Không tìm thấy đặt chỗ nào</p>
                </div>
            ) : (
                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                    {bookings.slice(0, 10).map((booking, index) => (
                        <BookingCardReveal
                            key={booking.idBooking}
                            idBooking={booking.idBooking}
                            index={index}
                        />
                    ))}

                    {bookings.length > 10 && (
                        <div className="text-center py-3 text-sky-700 font-semibold bg-sky-50 rounded-lg border border-sky-100 shadow-sm">
                            Hiển thị 10/{bookings.length} đặt chỗ.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
