// src/app/components/header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import { getCookie } from "cookies-next";

// Add custom styles for shimmer animation
const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
`;

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Use the auth context for login status
  const { isLoggedIn, logout } = useAuth();

  const userid = localStorage.getItem("current_user_id");
  const access_token = getCookie("token") || "";
  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR<UserResponse>(
    `https://aitripsystem-api.onrender.com/api/v1/users/idUser?lookup=${userid}`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Helper function to check if a route is active
  const isActiveRoute = (route: string) => {
    return pathname === route;
  };

  // Handle navigation with loading state
  const handleNavigation = (route: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (pathname === route) return; // Don't navigate if already on the route

    setIsNavigating(true);
    setIsDropdownOpen(false);

    // Add a small delay for visual feedback
    setTimeout(() => {
      router.push(route);
      // Reset navigation state after a delay
      setTimeout(() => setIsNavigating(false), 500);
    }, 150);
  };

  // Set mounted state to true after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to scroll to section with memoization to prevent unnecessary re-renders
  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    // Prevent default behavior to avoid page reload
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Check if we're in the browser environment
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    // Set the active section
    setActiveSection(id);

    // Find the element and scroll to it
    const element = document.getElementById(id);
    if (element) {
      // Use a small timeout to ensure the UI updates before scrolling
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 10);
    }

    // Close dropdown if it's open
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    // Close dropdown first if open
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }

    // Use setTimeout to ensure UI updates before logout processing
    setTimeout(() => {
      // Use the logout function from auth context
      logout();

      // Redirect to home page using router.replace to avoid adding to history
      router.replace("/");
    }, 10);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle scroll effect for header shadow and active section
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Add shadow when scrolled down (e.g., 50px from top)
      if (scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Update active section based on scroll position
      const aboutSection = document.getElementById("about");
      const featuresSection = document.getElementById("features");
      const contactSection = document.getElementById("contact");

      const scrollPosition = scrollY + 100; // Add offset for header height

      if (aboutSection && featuresSection && contactSection) {
        // Hide scroll indicator when we've scrolled deeper into the contact section
        if (scrollPosition >= contactSection.offsetTop + 300) {
          // Add 300px offset to hide it later
          setShowScrollIndicator(false);
        } else {
          setShowScrollIndicator(true);
        }

        // Update active section
        if (
          scrollPosition >= aboutSection.offsetTop &&
          scrollPosition < featuresSection.offsetTop
        ) {
          setActiveSection("about");
        } else if (
          scrollPosition >= featuresSection.offsetTop &&
          scrollPosition < contactSection.offsetTop
        ) {
          setActiveSection("features");
        } else if (scrollPosition >= contactSection.offsetTop) {
          setActiveSection("contact");
        } else {
          setActiveSection(null);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Call once on mount to set initial state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Inject custom styles */}
      <style jsx>{shimmerStyles}</style>

      {/* Scroll down indicator - only shows when not at footer and component is mounted */}
      {isMounted && showScrollIndicator && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#FFD700"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      )}

      <header
        className={`bg-gradient-to-r from-[#000080] to-[#00BFFF] flex items-center h-[80px] fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-b border-black/30"
            : ""
          } ${isNavigating ? "opacity-90" : ""}`}
      >
        {/* Navigation Loading Indicator */}
        {isNavigating && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] animate-pulse">
            <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
          </div>
        )}
        {/* Left side - Logo */}
        <div className="flex justify-start items-center p-4 gap-3 w-1/4">
          <div className="flex items-center justify-center">
            <div
              onClick={(e) => handleNavigation(isLoggedIn ? "/home" : "/", e)}
              className="cursor-pointer transition-transform duration-300 hover:scale-110"
            >
              <Image
                src="/images/logo.png"
                width={70}
                height={70}
                alt="logo"
                className="w-[70px] h-[70px] -my-1"
                priority
              />
            </div>
          </div>
          <div>
            <div
              onClick={(e) => handleNavigation(isLoggedIn ? "/home" : "/", e)}
              className="cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <span className="text-[#FFD700] text-4xl font-['PlaywriteDKLoopet'] tracking-wide">
                Explavue!
              </span>
            </div>
          </div>
        </div>

        {/* Center - Navigation */}
        <div className="flex justify-center items-center p-4 w-2/4">
          {/* Center menu items - only show when not logged in */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center justify-center mx-auto gap-20">
              <button
                onClick={(e) => scrollToSection("about", e)}
                className="flex items-center no-underline transition-all duration-300"
                aria-label="About"
              >
                <span
                  className={`text-lg font-medium ${activeSection === "about"
                      ? "text-[#FFD700]"
                      : "text-white hover:opacity-70"
                    }`}
                >
                  About
                </span>
              </button>

              <button
                onClick={(e) => scrollToSection("features", e)}
                className="flex items-center no-underline transition-all duration-300"
                aria-label="Features"
              >
                <span
                  className={`text-lg font-medium ${activeSection === "features"
                      ? "text-[#FFD700]"
                      : "text-white hover:opacity-70"
                    }`}
                >
                  Features
                </span>
              </button>

              <button
                onClick={(e) => scrollToSection("contact", e)}
                className="flex items-center no-underline transition-all duration-300"
                aria-label="Contact"
              >
                <span
                  className={`text-lg font-medium ${activeSection === "contact"
                      ? "text-[#FFD700]"
                      : "text-white hover:opacity-70"
                    }`}
                >
                  Contact
                </span>
              </button>
            </div>
          )}

          {/* Menu for logged in users */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center justify-center mx-auto gap-20">
              <div
                onClick={(e) => handleNavigation("/home", e)}
                className={`flex items-center no-underline transition-all duration-300 cursor-pointer relative ${isActiveRoute("/home")
                    ? "text-[#FFD700] scale-105"
                    : "text-white hover:opacity-70 hover:scale-105"
                  }`}
              >
                <span className="text-lg font-medium relative">
                  Trang chủ
                  {isActiveRoute("/home") && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full"></div>
                  )}
                </span>
              </div>

              <div
                onClick={(e) => handleNavigation("/trips", e)}
                className={`flex items-center no-underline transition-all duration-300 cursor-pointer relative ${isActiveRoute("/trips")
                    ? "text-[#FFD700] scale-105"
                    : "text-white hover:opacity-70 hover:scale-105"
                  }`}
              >
                <span className="text-lg font-medium relative">
                  Lộ trình AI
                  {isActiveRoute("/trips") && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full"></div>
                  )}
                </span>
              </div>              <div
                onClick={(e) => handleNavigation("/explore", e)}
                className={`flex items-center no-underline transition-all duration-300 cursor-pointer relative ${isActiveRoute("/explore")
                    ? "text-[#FFD700] scale-105"
                    : "text-white hover:opacity-70 hover:scale-105"
                  }`}
              >
                <span className="text-lg font-medium relative">
                  Khám phá
                  {isActiveRoute("/explore") && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full"></div>
                  )}
                </span>
              </div>

              <div
                onClick={(e) => handleNavigation("/ai-recommendations", e)}
                className={`flex items-center no-underline transition-all duration-300 cursor-pointer relative ${isActiveRoute("/ai-recommendations")
                    ? "text-[#FFD700] scale-105"
                    : "text-white hover:opacity-70 hover:scale-105"
                  }`}
              >
                <span className="text-lg font-medium relative">
                  Lịch sử AI
                  {isActiveRoute("/ai-recommendations") && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full"></div>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Buttons */}
        <div className="flex justify-end items-center p-4 w-1/4">
          {/* Login/Signup buttons - only show when not logged in */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-3">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push("/login");
                }}
                className="flex items-center no-underline text-black bg-[#FFD700] border-2 border-transparent rounded-md px-5 py-2 cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#FFD700]"
                aria-label="Login"
              >
                <span className="text-base font-medium">Login</span>
              </div>

              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push("/register");
                }}
                className="flex items-center no-underline text-black bg-[#FFD700] border-2 border-transparent rounded-md px-5 py-2 cursor-pointer transition-all duration-300 hover:bg-white hover:border-[#FFD700]"
                aria-label="Sign Up"
              >
                <span className="text-base font-medium">Sign Up</span>
              </div>
            </div>
          )}

          {/* Profile and Logout buttons - only show when logged in */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-3">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/yourbooking`);
                }}
                className="flex items-center no-underline text-white hover:opacity-70 transition-opacity duration-300 bg-transparent border border-white rounded-md px-5 py-2 cursor-pointer"
                aria-label="Profile"
              >
                <div className="w-6 h-6 mr-2 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                </div>
                <span className="text-base font-medium">Your Booking</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center no-underline text-white hover:opacity-90 transition-opacity duration-300 bg-[#4B3DB5] rounded-md px-5 py-2"
                aria-label="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className="text-base font-medium">Logout</span>
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div
            className="md:hidden relative inline-block ml-auto"
            ref={dropdownRef}
          >
            <div
              className="flex items-center text-white hover:opacity-70 transition-opacity duration-300"
              onClick={toggleDropdown}
              role="button"
              aria-expanded={isDropdownOpen}
              aria-label="Menu"
            >
              <Image
                src="/images/hamburger.svg"
                width={28}
                height={28}
                alt="menu"
              />
            </div>
            <div
              className={`absolute top-[80px] right-0 bg-white min-w-[200px] shadow-lg rounded-md z-50 opacity-0 transition-all duration-300 transform -translate-y-2 ${isDropdownOpen ? "block opacity-100 translate-y-0" : "hidden"
                }`}
            >
              <div className="flex flex-col md:hidden">
                {/* Menu items for non-logged in users */}
                {!isLoggedIn && (
                  <>
                    <button
                      className={`flex items-center p-3 no-underline w-full text-left transition-all duration-300 ${activeSection === "about"
                          ? "bg-[#FFD700] text-black"
                          : "text-black hover:bg-gray-200"
                        }`}
                      onClick={(e) => {
                        // Close dropdown first
                        setIsDropdownOpen(false);
                        // Use setTimeout to ensure dropdown closes before scrolling
                        setTimeout(() => {
                          scrollToSection("about", e);
                        }, 50);
                      }}
                    >
                      About
                    </button>
                    <button
                      className={`flex items-center p-3 no-underline w-full text-left transition-all duration-300 ${activeSection === "features"
                          ? "bg-[#FFD700] text-black"
                          : "text-black hover:bg-gray-200"
                        }`}
                      onClick={(e) => {
                        // Close dropdown first
                        setIsDropdownOpen(false);
                        // Use setTimeout to ensure dropdown closes before scrolling
                        setTimeout(() => {
                          scrollToSection("features", e);
                        }, 50);
                      }}
                    >
                      Features
                    </button>
                    <button
                      className={`flex items-center p-3 no-underline w-full text-left transition-all duration-300 ${activeSection === "contact"
                          ? "bg-[#FFD700] text-black"
                          : "text-black hover:bg-gray-200"
                        }`}
                      onClick={(e) => {
                        // Close dropdown first
                        setIsDropdownOpen(false);
                        // Use setTimeout to ensure dropdown closes before scrolling
                        setTimeout(() => {
                          scrollToSection("contact", e);
                        }, 50);
                      }}
                    >
                      Contact
                    </button>

                    <Link
                      href="/login"
                      key="mobile-login"
                      className="flex items-center text-black p-3 no-underline bg-[#FFD700] hover:bg-white hover:border-[#FFD700] hover:border-2 w-full text-left transition-all duration-300"
                      onClick={() => {
                        // Close dropdown first
                        setIsDropdownOpen(false);
                      }}
                      prefetch={false}
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      key="mobile-signup"
                      className="flex items-center text-black p-3 no-underline bg-[#FFD700] hover:bg-white hover:border-[#FFD700] hover:border-2 w-full text-left transition-all duration-300"
                      onClick={() => {
                        // Close dropdown first
                        setIsDropdownOpen(false);
                      }}
                      prefetch={false}
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {/* Menu items for logged in users */}
                {isLoggedIn && (
                  <>
                    <div
                      onClick={(e) => handleNavigation("/home", e)}
                      className={`flex items-center text-black p-3 no-underline hover:bg-gray-200 w-full text-left cursor-pointer transition-all duration-200 ${isActiveRoute("/home")
                          ? "bg-blue-50 border-l-4 border-[#FFD700] font-semibold"
                          : ""
                        }`}
                    >
                      Trang chủ
                      {isActiveRoute("/home") && (
                        <span className="ml-auto text-[#FFD700]">●</span>
                      )}
                    </div>

                    <div
                      onClick={(e) => handleNavigation("/trips", e)}
                      className={`flex items-center text-black p-3 no-underline hover:bg-gray-200 w-full text-left cursor-pointer transition-all duration-200 ${isActiveRoute("/trips")
                          ? "bg-blue-50 border-l-4 border-[#FFD700] font-semibold"
                          : ""
                        }`}
                    >
                      Lộ trình AI
                      {isActiveRoute("/trips") && (
                        <span className="ml-auto text-[#FFD700]">●</span>
                      )}
                    </div>                    <div
                      onClick={(e) => handleNavigation("/explore", e)}
                      className={`flex items-center text-black p-3 no-underline hover:bg-gray-200 w-full text-left cursor-pointer transition-all duration-200 ${isActiveRoute("/explore")
                          ? "bg-blue-50 border-l-4 border-[#FFD700] font-semibold"
                          : ""
                        }`}
                    >
                      Khám phá
                      {isActiveRoute("/explore") && (
                        <span className="ml-auto text-[#FFD700]">●</span>
                      )}
                    </div>

                    <div
                      onClick={(e) => handleNavigation("/ai-recommendations", e)}
                      className={`flex items-center text-black p-3 no-underline hover:bg-gray-200 w-full text-left cursor-pointer transition-all duration-200 ${isActiveRoute("/ai-recommendations")
                          ? "bg-blue-50 border-l-4 border-[#FFD700] font-semibold"
                          : ""
                        }`}
                    >
                      Lịch sử AI
                      {isActiveRoute("/ai-recommendations") && (
                        <span className="ml-auto text-[#FFD700]">●</span>
                      )}
                    </div>
                  </>
                )}

                {isLoggedIn && (
                  <Link
                    href={`/profile/${userid}`}
                    key="mobile-profile"
                    className="flex items-center text-black p-3 no-underline hover:bg-gray-200 w-full text-left"
                    onClick={() => setIsDropdownOpen(false)}
                    prefetch={false}
                  >
                    <div className="w-6 h-6 mr-2 relative">
                      <Image
                        src={
                          userData?.avatar
                            ? `https://aitripsystem-api.onrender.com/api/v1/proxy_image/?url=${encodeURIComponent(
                              userData.avatar
                            )}`
                            : "profile.svg"
                        }
                        fill
                        className="rounded-full object-cover"
                        alt="profile"
                      />
                    </div>
                    Profile
                  </Link>
                )}

                {/* Logout button for mobile menu if logged in */}
                {isLoggedIn && (
                  <div
                    className="flex items-center text-black p-3 no-underline hover:bg-gray-200 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      // Close dropdown first
                      setIsDropdownOpen(false);
                      // Use setTimeout to ensure dropdown closes before logout
                      setTimeout(() => {
                        handleLogout();
                      }, 50);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Log out
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
