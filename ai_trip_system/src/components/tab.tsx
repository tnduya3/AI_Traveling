import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaStar, FaStarHalfStroke, FaRegStar } from "react-icons/fa6";
import ModalImage from "react-modal-image";
import dynamic from "next/dynamic";
import { getCookie } from "cookies-next";
import WeatherCard from "./weatherCard";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

type TabProp = {
  label: string;
  count?: number;
  content: React.ReactNode;
};

type TabProps = {
  activity: Activity;
  idPlace: string;
};

type PlaceReviewResponse = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
};

const Tab = ({ activity, idPlace }: TabProps) => {
  console.log(idPlace);
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [reviews, setReviews] = useState<PlaceReviewResponse[]>([]);
  const [images, setImages] = useState<PlaceImageResponse[]>([]);
  const [weatherMap, setWeatherMap] = useState<Record<string, any>>({});
  const token = getCookie("token");
  const [underlineProps, setUnderlineProps] = useState<{
    width: number;
    left: number;
  }>({
    width: 0,
    left: 0,
  });

  useEffect(() => {
    const fetchImages = async () => {
      const imagesRes = await fetch(
        `https://aitripsystem-api.onrender.com/api/v1/place_images/places/${idPlace}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!imagesRes.ok) {
        setImages([]);
        return;
      }
      const imageDatas = await imagesRes.json();
      setImages(imageDatas);
    };

    fetchImages();
  }, [idPlace, token]);

  useEffect(() => {
    async function fetchGoogleReviews() {
      const res = await fetch(
        `/api/google-place/reviews?lat=${activity.lat}&lon=${activity.lon}`
      );
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    }

    fetchGoogleReviews();
  }, [activity.lat, activity.lon]);

  const tabs: TabProp[] = [
    {
      label: "Thông tin",
      content: (
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-2">
            📍 {activity.namePlace}
          </h2>

          <p className="text-gray-600 text-sm">
            🏙️ <span className="font-semibold">Thành phố:</span> {activity.city}
          </p>

          <p className="text-gray-600 text-sm">
            📬 <span className="font-semibold">Địa chỉ:</span>{" "}
            {activity.address}
          </p>

          <p className="text-gray-800 text-sm">
            📝 <span className="font-semibold">Mô tả:</span>{" "}
            {activity.description}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-sm text-gray-700 font-medium">
              {activity.rating} / 5
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Đánh giá",
      count: reviews.length,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Đánh giá</h2>
          {reviews.length === 0 ? (
            <p>Địa điểm chưa có đánh giá nào</p>
          ) : (
            reviews.map((review, i) => (
              <div
                key={i}
                className="border-1 rounded-md p-5 bg-gray-100 shadow-md mb-5"
              >
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Image
                      src={
                        review.profile_photo_url
                          ? `https://aitripsystem-api.onrender.com/api/v1/proxy_image/?url=${encodeURIComponent(
                              review.profile_photo_url
                            )}`
                          : "/profile.svg"
                      }
                      alt="Avatar"
                      width={50}
                      height={50}
                      className="rounded-full"
                    />

                    <div>
                      <p className="font-bold">{review.author_name}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const rating = review.rating ?? 0;
                          return i < Math.floor(rating) ? (
                            <FaStar key={i} className="text-yellow-500" />
                          ) : rating - i >= 0.5 ? (
                            <FaStarHalfStroke
                              key={i}
                              className="text-yellow-500"
                            />
                          ) : (
                            <FaRegStar key={i} className="text-yellow-500" />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p>{review.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      label: "Hình ảnh",
      count: images.length,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Hình ảnh</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative">
            {images.map((src, i) => (
              <ModalImage
                key={i}
                className="cursor-pointer rounded-lg"
                alt="..."
                small={`https://aitripsystem-api.onrender.com/api/v1/proxy_image/?url=${encodeURIComponent(
                  src.image
                )}`}
                large={`https://aitripsystem-api.onrender.com/api/v1/proxy_image/?url=${encodeURIComponent(
                  src.image
                )}`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Bản đồ",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Bản đồ</h2>
          <div className="h-[350px]">
            <MapView
              location={{
                name: activity.namePlace,
                lat: activity.lat,
                lon: activity.lon,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Thời tiết",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Thời tiết</h2>
          <WeatherCard activity={activity} />
        </div>
      ),
    },
    {
      label: "Khác",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Khác</h2>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const updateUnderline = () => {
      const tab = tabRef.current[activeTab];
      if (tab) {
        const { offsetWidth, offsetLeft } = tab;
        setUnderlineProps({
          width: offsetWidth,
          left: offsetLeft,
        });
      }
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => {
      window.removeEventListener("resize", updateUnderline);
    };
  }, [activeTab]);

  return (
    <div className="w-full">
      <div className="border-b relative flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={(el) => (tabRef.current[index] = el)}
            className={`group relative flex-1 text-center py-3 text-sm font-medium transition-colors duration-300 ${
              index === activeTab
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab(index)}
          >
            <div className="flex justify-center items-center gap-0.5 p-0.5 font-bold">
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="inline-block bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 text-xs ml-0.5">
                  {tab.count}
                </span>
              )}

              <span
                className={`absolute bottom-0 left-0 transform h-0.5 bg-blue-400 transition-transform duration-300 origin-left scale-x-0 w-full group-hover:scale-x-100 ${
                  index === activeTab ? "hidden" : "block"
                }`}
              />
            </div>
          </button>
        ))}

        <motion.div
          className="absolute bottom-0 h-1 bg-blue-500 rounded-t"
          animate={{
            width: underlineProps.width,
            left: underlineProps.left,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="p-5">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tab;
