import Image from "next/image";
import { useState, useRef, useEffect, useCallback, act } from "react";
import Tab from "./tab";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { getCookie } from "cookies-next";

type CarouselProps = {
  activities: Activity[];
};

const Carousel = ({ activities }: CarouselProps) => {
  const imageWidth = 300;
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [showInfo, setShowInfo] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [activityImages, setActivityImages] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [idPlaceArray, setIdPlaceArray] = useState<string[]>([]);

  const getVisibleCount = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };
  const [visibleCount, setVisibleCount] = useState<number>(getVisibleCount());
  const token = getCookie("token");

  useEffect(() => {
    const fetchImages = async () => {
      const urls: string[] = [];
      const loading: boolean[] = [];
      const idplaces: string[] = [];

      for (let i = 0; i < activities.length; i++) {
        loading[i] = true;
        try {
          const activity = activities[i];

          const placeRes = await fetch(
            `https://aitripsystem-api.onrender.com/api/v1/places/loc/${activity.lat}&${activity.lon}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const placeData = await placeRes.json();
          const idPlace = placeData?.idplace;

          if (idPlace) {
            idplaces[i] = idPlace;
            const imageRes = await fetch(
              `https://aitripsystem-api.onrender.com/api/v1/place_images/${idPlace}/random`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!imageRes.ok) {
              urls[i] = "/default.jpg";
              continue;
            }
            const imageData = await imageRes.json();
            urls[i] = imageData.image;
          } else {
            urls[i] = "/default.jpg";
          }
        } catch (err) {
          console.error("Lỗi khi fetch ảnh:", err);
          urls[i] = "/default.jpg";
        } finally {
          loading[i] = false;
        }
      }

      setActivityImages(urls);
      setLoadingStates(loading);
      setIdPlaceArray(idplaces);
    };

    fetchImages();
  }, [activities, token]);

  const maxIndex = Math.ceil(activityImages.length / visibleCount);

  const goto = useCallback(
    (newIndex: number) => {
      setSelectedIndex(newIndex * visibleCount);
    },
    [visibleCount]
  );

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.transform = `translateX(-${
        index * visibleCount * imageWidth
      }px)`;
    }
  }, [index, visibleCount]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (touchDeltaX.current > 50) goto(index - 1);
    else if (touchDeltaX.current < -50) goto(index + 1);
    touchDeltaX.current = 0;
  };

  const handleNext = () => {
    const next = selectedIndex + 1;
    setSelectedIndex(next >= activityImages.length ? 0 : next);
  };
  const handlePrev = () => {
    const prev = selectedIndex - 1;
    setSelectedIndex(prev < 0 ? activityImages.length - 1 : prev);
  };

  useEffect(() => {
    setIndex(Math.floor(selectedIndex / visibleCount));
  }, [selectedIndex, visibleCount]);

  const handleClickImage = (idx: number) => {
    if (selectedIndex === idx) setShowInfo((prev) => !prev);
    else {
      setSelectedIndex(idx);
      setShowInfo(true);
    }
    setHasVisited(true);
  };

  return (
    <>
      <div className="px-10 py-3 relative">
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={containerRef}
            className="flex gap-4 transition-transform duration-500 ease-in-out"
          >
            {activityImages.map((src, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[300px] h-[200px] relative rounded-xl overflow-hidden shadow-md hover:shadow-lg"
                onClick={() => handleClickImage(i)}
              >
                {loadingStates[i] || !src ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Image
                    src={
                      src.startsWith("https://")
                        ? `https://aitripsystem-api.onrender.com/api/v1/proxy_image/?url=${encodeURIComponent(
                            src
                          )}`
                        : src
                    }
                    alt={activities[i].namePlace}
                    fill
                    sizes="(max-width: 500px) 100vw, (max-width: 500px) 50vw, 33vw"
                    loading="lazy"
                    className={`object-cover transition-transform duration-500 cursor-pointer rounded-xl ${
                      selectedIndex === i
                        ? "opacity-100 scale-105 ring-2 ring-blue-400"
                        : "opacity-50 hover:opacity-80"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {activityImages.length > visibleCount && (
          <>
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: maxIndex }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i * visibleCount)}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-colors duration-300 ${
                    i === index ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></button>
              ))}
            </div>

            <FaAngleLeft
              className="w-8 h-8 text-black bg-white/60 rounded-full absolute top-1/2 -translate-y-1/2 left-2 hover:bg-black/20 shadow-lg backdrop-blur-sm z-10 cursor-pointer"
              aria-hidden="true"
              onClick={handlePrev}
            />
            <FaAngleRight
              className="w-8 h-8 text-black bg-white/60 rounded-full absolute top-1/2 -translate-y-1/2 right-2 hover:bg-black/20 shadow-lg backdrop-blur-sm z-10 cursor-pointer"
              aria-hidden="true"
              onClick={handleNext}
            />
          </>
        )}
      </div>

      {hasVisited && (
        <div
          className={`p-4 bg-white rounded-xl shadow-lg transition-opacity duration-500 ${
            showInfo ? "opacity-100 block" : "opacity-0 hidden"
          }`}
        >
          <Tab
            activity={activities[selectedIndex]}
            idPlace={idPlaceArray[selectedIndex]}
          />
        </div>
      )}
    </>
  );
};

export default Carousel;
