import React from 'react'
import { FaList, FaMap, FaStar, FaMapMarkerAlt } from "react-icons/fa";


interface Place {
  name: string;
  country: string;
  city: string;
  province: string;
  address: string;
  description: string;
  image: string;
  rating: number;
  idPlace: string;
}

export default function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="bg-indigo-200 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-4">
        <div className="flex space-x-4">
          {/* Image - sử dụng thẻ img thông thường */}
          <div className="flex-shrink-0 w-20 h-20 relative">
            <img
              src={place.image || "elementor-placeholder-image.webp"}
              alt={place.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {place.name}
            </h3>
            
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <FaMapMarkerAlt className="w-3 h-3 mr-1" />
              <span className="truncate">
                {place.city}, {place.province}
              </span>
            </div>
            
            {place.rating > 0 && (
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(place.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1 text-sm text-gray-600">
                  {place.rating.toFixed(1)}
                </span>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {place.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

