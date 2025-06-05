"use client";

import AllBookings from "./AllBookings";

function AllBookingsPage() {
  return (
    <div className="min-h-screen ">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Lịch sử Booking
          </h1>
          <p className="text-lg md:text-xl mx-4 text-gray-500/90">
            Đây là tất cả các đặt chỗ của bạn. Bạn có thể xem, chỉnh sửa hoặc
            hủy chúng.
          </p>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-4 items-center justify-center filter backdrop-blur-sm bg-white/30 rounded-2xl shadow-lg sm:px-6 lg:px-8">
        <div className="mt-6 ">
            <AllBookings />
        </div>
      </main>
    </div>
  );
}

export default AllBookingsPage;
