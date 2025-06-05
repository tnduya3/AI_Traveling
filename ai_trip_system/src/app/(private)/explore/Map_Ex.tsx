"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaMapMarkerAlt,
  FaTimes,
  FaLocationArrow,
  FaUtensils,
  FaHotel,
  FaLandmark,
  FaUmbrellaBeach,
  FaStar,
} from "react-icons/fa";

// Fix default icon issue in Leaflet when using with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Vietnam bounds for initial view
const VIETNAM_CENTER: [number, number] = [14.0583, 108.2772];
const VIETNAM_ZOOM = 6;

// Custom user location icon
const userLocationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Component để xử lý sự kiện click trên map
const MapClickHandler = ({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationClick(lat, lng);
    },
  });
  return null;
};

// Hàm để lấy tên tỉnh từ tọa độ (sử dụng reverse geocoding)
const getProvinceFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi`
    );
    const data = await response.json();
    
    // Lấy thông tin tỉnh từ response
    const province = data.address?.state || data.address?.province || data.address?.city || null;
    return province;
  } catch (error) {
    console.error("Error getting province:", error);
    return null;
  }
};

// Interface cho props của Map component
interface MapProps {
  onProvinceSelect?: (province: string) => void;
  className?: string;
}

export default function MapEx({ onProvinceSelect, className = "" }: MapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  // Lấy vị trí hiện tại của người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const handleLocationClick = async (lat: number, lng: number) => {
    setLoading(true);
    setSelectedLocation([lat, lng]);
    
    try {
      const province = await getProvinceFromCoordinates(lat, lng);
      if (province && onProvinceSelect) {
        onProvinceSelect(province);
      }
    } catch (error) {
      console.error("Error handling location click:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Đang tìm địa điểm...</span>
          </div>
        </div>
      )}
      
      <MapContainer
        center={VIETNAM_CENTER}
        zoom={VIETNAM_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Chỉ thêm MapClickHandler nếu có onProvinceSelect */}
        {onProvinceSelect && <MapClickHandler onLocationClick={handleLocationClick} />}
        
        {/* Marker cho vị trí người dùng */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}
        
        {/* Marker cho vị trí đã chọn */}
        {selectedLocation && (
          <Marker position={selectedLocation}>
            <Popup>Vị trí đã chọn</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}