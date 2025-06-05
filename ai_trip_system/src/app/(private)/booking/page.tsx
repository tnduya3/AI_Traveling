import BookingForm from "@/app/(private)/booking/BookingForm";
import HotelForm from "@/app/(private)/booking/HotelForm";

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="info bg-white rounded-lg p-6 shadow-md h-screen">
          <h1 className="text-2xl font-bold text-blue-900 mb-6 flex">
            Thông tin đặt lịch
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <BookingForm />
            </div>
            <div className="flex-1">
              <HotelForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
