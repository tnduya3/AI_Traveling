'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // dung next/image cho cac anh vi du

// Sample hotel data
const hotels = [
  {
    id: 1,
    name: 'Royal Hotel & Spa',
    image: '/destinations/halong.jpg',
    rating: 4.8,
    price: 120,
    location: 'Hạ Long Bay'
  },
  {
    id: 2,
    name: 'Sunrise Resort',
    image: '/destinations/hoian.jpg',
    rating: 4.5,
    price: 95,
    location: 'Hội An'
  },
  {
    id: 3,
    name: 'Ocean View Suites',
    image: '/destinations/nhatrang.jpg',
    rating: 4.7,
    price: 150,
    location: 'Nha Trang'
  },
  {
    id: 4,
    name: 'Mountain Retreat',
    image: '/destinations/sapa.jpg',
    rating: 4.6,
    price: 85,
    location: 'Sa Pa'
  },
  {
    id: 5,
    name: 'City Central Hotel',
    image: '/destinations/default.jpg',
    rating: 4.3,
    price: 75,
    location: 'Hà Nội'
  },
  {
    id: 6,
    name: 'Riverside Inn',
    image: '/destinations/hoian.jpg',
    rating: 4.2,
    price: 80,
    location: 'Hội An'
  },
  {
    id: 7,
    name: 'Golden Sands Resort',
    image: '/destinations/nhatrang.jpg',
    rating: 4.9,
    price: 160,
    location: 'Nha Trang'
  },
  {
    id: 8,
    name: 'Heritage Hotel',
    image: '/destinations/default.jpg',
    rating: 4.4,
    price: 100,
    location: 'Hà Nội'
  }
];

export default function HotelForm() {
  const [currentIndex, setCurrentIndex] = useState(0); // index hien tai 
  const [isMobile, setIsMobile] = useState(false); // bien de kiem tra mobile hay khong
  const [cardWidth, setCardWidth] = useState(0); // width cua card
  const carouselRef = useRef<HTMLDivElement>(null); // ref de lay width cua carousel
  
  // Handle resize events to detect mobile vs desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px la breakpoint cua mobile
      
      // Calculate card width based on container width
      if (carouselRef.current) { // lay width cua carousel
        const containerWidth = carouselRef.current.offsetWidth; 
        if (window.innerWidth < 768) {
          setCardWidth(containerWidth - 32); // Full width with some padding on mobile
        } else {
          // Adjust card width for better appearance when placed next to BookingForm
          // Showing 3 cards instead of 5 for better visibility
          setCardWidth((containerWidth - 48) / 3);
        }
      }
    };

    handleResize(); // dung ham de lay width ngay khi component duoc mount
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize); // cleanup
    };
  }, []);

  const totalCards = hotels.length; // total so luong khach san
  // Adjusted maxIndex to account for showing 3 cards on desktop instead of 5
  const maxIndex = Math.max(0, isMobile ? totalCards - 1 : totalCards - 3); // Ensure maxIndex is non-negative
  // maxIndex = totalCards - 1 neu la mobile, maxIndex = totalCards - 3 neu la desktop

  // Modified to loop around when reaching the end
  const goNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  // Modified to loop around when reaching the beginning
  const goPrev = () => {
    setCurrentIndex(prevIndex => 
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  // Tạo mảng hotels động để hiển thị với cơ chế vòng quay
  const getVisibleHotels = () => {
    // Tạo mảng mới với cấu trúc [all hotels] + [first few hotels] để hỗ trợ hiệu ứng vòng quay
    const extendedHotels = [...hotels];
    
    if (isMobile) {
      // Trên mobile, chỉ hiển thị 1 khách sạn tại một thời điểm
      return [hotels[currentIndex]];
    } else {
      // Trên desktop, hiển thị 3 khách sạn liên tiếp từ vị trí currentIndex
      return [
        hotels[currentIndex % totalCards],
        hotels[(currentIndex + 1) % totalCards],
        hotels[(currentIndex + 2) % totalCards],
      ];
    }
  };

  const visibleHotels = getVisibleHotels();

  return (
    <div className="w-full px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Các điểm du lịch gợi ý</h2>
      
      <div className="relative w-full overflow-hidden" ref={carouselRef}>
        <div 
          className={`flex transition-transform duration-300 ease-in-out`}
          style={{ 
            transform: isMobile ? 'translateX(0)' : `translateX(-${currentIndex * (cardWidth)}px)`
          }}
        >
          {visibleHotels.map((hotel, idx) => {

            return (
              <div
                key={`${hotel.id}-${idx}`}
                className={`relative flex-shrink-0 p-2 transition-all duration-300 ease-in-out`}
                style={{ width: cardWidth }}
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                  <div className="relative h-48 md:h-60">
                    <Image
                      src={hotel.image}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{hotel.name}</h3>
                    <div className="flex items-center mb-2"> 
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-gray-600">{hotel.rating}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{hotel.location}</span>
                      <span className="font-bold">${hotel.price}/đêm</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons - Modified to remove disabled state */}
        <button 
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-20 opacity-100 hover:bg-gray-100"
          aria-label="Previous"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-20 opacity-100 hover:bg-gray-100"
          aria-label="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Indicators (dots) */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`mx-1 w-2 h-2 rounded-full ${currentIndex === idx ? 'bg-blue-600' : 'bg-gray-300'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}