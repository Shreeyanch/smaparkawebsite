import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const navbarHeight = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMenuOpen(false);
        setIsServicesOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll);
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDesktop = window.innerWidth >= 1024;
      if (
        isDesktop &&
        isServicesOpen &&
        !event.target.closest(".services-dropdown")
      ) {
        setIsServicesOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isServicesOpen]);

  return (
    <div
      className={`flex justify-center w-full fixed top-0 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? "transform translate-y-0" : "transform -translate-y-full"
      }`}
    >
      <nav
        className="px-6 md:px-8 py-3 md:py-4 mx-4 md:mx-6 mt-4 max-w-6xl w-full"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(25px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "20px",
          boxShadow:
            "0 8px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          WebkitBackdropFilter: "blur(25px)",
        }}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img
                src="/landingPage/images/logo_black.png"
                className="w-24 md:w-36"
                alt="Logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex gap-4 justify-center items-center flex-1">
            <div>
              <ul className="flex gap-6">
                <li
                  onClick={() => scrollToSection("home")}
                  className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm"
                >
                  Home
                  <span
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                    style={{
                      background: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow:
                        "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                    }}
                  ></span>
                </li>

                {/* Services Dropdown */}
                <li
                  className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm services-dropdown"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                >
                  Our Services
                  <span
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                    style={{
                      background: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow:
                        "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                    }}
                  ></span>
                  {/* Dropdown Menu */}
                  {isServicesOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-56 rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(25px)",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      <div className="py-2">
                        <Link
                          to="/services"
                          onClick={() => {
                            setIsServicesOpen(false);
                            window.scrollTo(0, 0);
                          }}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          Cloud Loyalty System
                        </Link>
                        <Link
                          to="/ReviewQrGenerator"
                          onClick={() => {
                            setIsServicesOpen(false);
                            window.scrollTo(0, 0);
                          }}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          Review QR Generator{" "}
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full ml-1">
                            New
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}
                </li>

                <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
                  <Link to="/pricing">Pricing</Link>
                  <span
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                    style={{
                      background: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow:
                        "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                    }}
                  ></span>
                </li>
                <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
                  <Link to="/blog">Blog</Link>
                  <span
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                    style={{
                      background: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow:
                        "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                    }}
                  ></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Desktop Right Side - Login Button */}
          <div className="hidden lg:flex items-center justify-center gap-4">
            <button
              className="p-2 w-32 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-800 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-2 sm:gap-3 md:gap-4 overflow-hidden transition-transform duration-200 cursor-pointer group hover:scale-105"
              onClick={() => navigate("/login")}
              style={{
                boxShadow: `
                  inset 0px -3px 3px 1px rgba(255,245,221,0.10),
                  inset 2.5px -2px 3px 0px rgba(124,108,94,0.75),
                  inset 0px -3px 1px 0px rgba(0,0,0,0.50),
                  inset 1px 1px 3px 3px rgba(26,24,24,1.00),
                  inset 0px 4.75px 0.25px -2.5px rgba(251,251,251,1.00),
                  inset 1.25px 1.5px 0px 0px rgba(0,0,0,0.75),
                  inset 3px 5px 2px -4.75px rgba(255,255,255,1.00),
                  inset 0px 0px 0.25px 1.25px rgba(38,37,36,1.00)
                `,
              }}
            >
              <span className="text-xs sm:text-sm md:text-md font-medium text-white">
                Dashboard
              </span>
            </button>
          </div>

          {/* Mobile/Tablet Hamburger Menu */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-2xl transition-all duration-300 focus:outline-none hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow:
                  "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                <span
                  className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                ></span>
                <span
                  className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div
            className="py-6 mt-4 rounded-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(25px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow:
                "0 8px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
              WebkitBackdropFilter: "blur(25px)",
            }}
          >
            {/* Navigation Links */}
            <ul className="space-y-2 mb-6 px-4">
              <li
                onClick={() => scrollToSection("home")}
                className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm"
              >
                Home
                <span
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: "rgba(255, 255, 255, 0.4)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow:
                      "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  }}
                ></span>
              </li>

              {/* Services with submenu */}
              <li>
                <div
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative px-3 py-2 text-sm flex justify-between items-center"
                >
                  Our Services
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isServicesOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {isServicesOpen && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li className="cursor-pointer text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium px-3 py-1.5 text-sm">
                      <Link
                        to="/services"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsServicesOpen(false);
                          window.scrollTo(0, 0);
                        }}
                      >
                        Cloud Loyalty System
                      </Link>
                    </li>
                    <li className="cursor-pointer text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium px-3 py-1.5 text-sm">
                      <Link
                        to="/ReviewQrGenerator"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsServicesOpen(false);
                          window.scrollTo(0, 0);
                        }}
                      >
                        Review QR Generator{" "}
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full ml-1">
                          New
                        </span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li
                onClick={() => setIsMenuOpen(false)}
                className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm"
              >
                <Link to="/pricing">Pricing</Link>
                <span
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: "rgba(255, 255, 255, 0.4)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow:
                      "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  }}
                ></span>
              </li>
              <li
                onClick={() => setIsMenuOpen(false)}
                className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm"
              >
                <Link to="/blog">Blog</Link>
                <span
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: "rgba(255, 255, 255, 0.4)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow:
                      "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  }}
                ></span>
              </li>
            </ul>

            {/* Login Button */}
            <div className="mx-4 mt-4">
              <button
                className="w-full pl-6 pr-3 py-2.5 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-800 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-3 overflow-hidden transition-transform duration-200 cursor-pointer hover:scale-105"
                onClick={() => navigate("/login")}
                style={{
                  boxShadow: `
                      inset 0px -3px 3px 1px rgba(255,245,221,0.10),
                      inset 2.5px -2px 3px 0px rgba(124,108,94,0.75),
                      inset 0px -3px 1px 0px rgba(0,0,0,0.50),
                      inset 1px 1px 3px 3px rgba(26,24,24,1.00),
                      inset 0px 4.75px 0.25px -2.5px rgba(251,251,251,1.00),
                      inset 1.25px 1.5px 0px 0px rgba(0,0,0,0.75),
                      inset 3px 5px 2px -4.75px rgba(255,255,255,1.00),
                      inset 0px 0px 0.25px 1.25px rgba(38,37,36,1.00)
                    `,
                }}
              >
                <span className="text-sm font-medium text-white">Login</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
