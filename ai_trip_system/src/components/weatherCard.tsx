import { useEffect, useState } from "react";

type WeatherProps = {
  activity: {
    lat: number;
    lon: number;
    namePlace: string;
  };
};

const weatherCache = new Map<string, any>(); // key = `${lat},${lon}`

export default function WeatherCard({ activity }: WeatherProps) {
  const [weather, setWeather] = useState<any>(null);
  const key = `${activity.lat},${activity.lon}`;

  useEffect(() => {
    const fetchWeather = async () => {
      if (weatherCache.has(key)) {
        setWeather(weatherCache.get(key));
        return;
      }

      try {
        const res = await fetch(
          `/api/weather?lat=${activity.lat}&lon=${activity.lon}`
        );
        const data = await res.json();
        weatherCache.set(key, data);
        setWeather(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
      }
    };

    fetchWeather();
  }, [key, activity.lat, activity.lon]);

  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        Thời tiết tại {activity.namePlace}
      </h3>

      {weather ? (
        <div className="text-sm text-gray-700 space-y-1">
          <p>🌤️ Trạng thái: {weather.weather?.[0]?.description}</p>
          <p>🌡️ Nhiệt độ: {weather.main?.temp}°C</p>
          <p>💧 Độ ẩm: {weather.main?.humidity}%</p>
          <p>💨 Gió: {weather.wind?.speed} m/s</p>
        </div>
      ) : (
        <p className="text-gray-500">Đang tải thời tiết...</p>
      )}
    </div>
  );
}
