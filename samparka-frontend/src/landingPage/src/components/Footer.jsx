import React, { useState, useRef } from "react";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Award from "./Award";

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 100; // Approximate navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };
  const [transform, setTransform] = useState(
    "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)"
  );
  const footerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!footerRef.current) return;

    const rect = footerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Calculate rotation based on horizontal mouse position
    const centerX = rect.width / 2;
    const rotateZ = ((x - centerX) / centerX) * 15; // Max 15 degrees rotation

    setTransform(
      `translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(${rotateZ}deg) skew(0deg, 0deg)`
    );
  };

  const handleMouseLeave = () => {
    setTransform(
      "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)"
    );
  };
  return (
    <footer
      ref={footerRef}
      className="bg-gray-50  w-full relative overflow-hidden "
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-[15vh] bg-[#F6F4F7]">{/* <Award/> */}</div>

      {/* Bottom Footer */}
      <div className="flex items-end relative bg-black min-h-[60vh] px-6 sm:px-10 md:px-16 lg:px-20 pt-32 sm:pt-40 md:pt-10 pb-10 rounded-t-3xl md:rounded-t-[40px]">
        {/* Right Side - Phone Image */}
        <div className="absolute bottom-0 -right-4 sm:-right-6 md:-bottom-8 md:-right-16 lg:-bottom-4 lg:-right-10 hidden sm:block z-40">
          <div className="relative">
            <a
              href="https://wa.me/9779766387030?text=Hi%21%20I%20found%20Samparka%20online%20and%20would%20love%20to%20learn%20more%20about%20how%20it%20works%20😊"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Start conversation on WhatsApp"
            >
              <img
                src="/landingPage/images/footerphone.png"
                alt="Chat with Samparka on WhatsApp"
                className="h-40 sm:h-60 md:h-90 lg:h-120 object-contain transition-transform duration-300 ease-out cursor-pointer"
                style={{
                  willChange: "transform",
                  transform: transform,
                  transformStyle: "preserve-3d",
                  transformOrigin: "bottom right",
                }}
              />
            </a>
          </div>
        </div>

        {/* lets get started */}
        <div className="absolute -top-16 sm:-top-20 md:-top-22 lg:-top-25 left-6 sm:left-10 md:left-40 lg:left-20 right-6 sm:right-10 md:right-auto max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
          <div className="bg-[#9A9A9A]/30 rounded-3xl md:rounded-[40px]    backdrop-blur-lg px-6 sm:px-10 md:px-11 lg:px-12 py-6 sm:py-7 md:py-7.5 lg:py-8 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-3.5xl lg:text-4xl font-regular text-[#202020] mb-3 md:mb-3.5 lg:mb-4">
              Let's get started.
            </h2>
            <p className="  mb-4 md:mb-5 lg:mb-6 text-xs sm:text-sm text-white ">
              We arent just a loyalty platform, we are your growth partner
            </p>
            <button
              className="mt-4 sm:mt-6 md:mt-8 pl-4 sm:pl-5 md:pl-6 pr-2 sm:pr-2.5 md:pr-3 py-1.5 sm:py-2 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-800 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-2 sm:gap-3 md:gap-4 overflow-hidden transition-transform duration-200 cursor-pointer group"
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
              <span className="text-sm sm:text-base md:text-md font-medium text-white">
                Book a demo
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black sm:w-[14px] sm:h-[14px] md:w-4 md:h-4"
                >
                  <path
                    d="M5 12h14m-7-7l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Recognition Section - Hidden on mobile, shown on larger screens */}
        <div className="mb-8 md:mb-10 lg:mb-12  hidden lg:flex flex-col items-center absolute top-1/2 -translate-y-1/2 right-72">
          <h3 className="text-white text-lg sm:text-xl md:text-3xl font-medium mb-4 md:mb-6 text-center">
            Recognition
          </h3>
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-2xl">
            <div className=" md:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-3xl md:rounded-[20px]    backdrop-blur-lg px-2 sm:px-10 md:px-4 lg:px-2 py-6 sm:py-7 md:py-7.5 lg:py-2 text-center md:text-left">
              <img
                src="/landingPage/images/awards/babal.png"
                alt="Babal Award"
                className="w-full h-16 md:h-20 object-contain"
              />
              <p className="text-gray-300">Babal Challenge</p>
            </div>
            <div className=" md:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-3xl md:rounded-[20px]    backdrop-blur-lg px-2 sm:px-10 md:px-4 lg:px-2 py-6 sm:py-7 md:py-7.5 lg:py-2 text-center md:text-left ">
              <img
                src="/landingPage/images/awards/ictaward.png"
                alt="ICT Award"
                className="w-full h-16 md:h-20 object-contain"
              />
              <p className="text-gray-300">ICT Award</p>
            </div>
            <div className=" md:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-3xl md:rounded-[20px]    backdrop-blur-lg px-2 sm:px-10 md:px-4 lg:px-2 py-6 sm:py-7 md:py-7.5 lg:py-2 text-center md:text-left ">
              <img
                src="/landingPage/images/awards/nyef.png"
                alt="NYEF"
                className="w-full h-16 md:h-20 object-contain"
              />
              <p className="text-gray-300">NYEF</p>
            </div>
            <div className="  md:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-3xl md:rounded-[20px]    backdrop-blur-lg px-2 sm:px-10 md:px-4 lg:px-2 py-6 sm:py-7 md:py-7.5 lg:py-2 text-center md:text-left">
              <img
                src="/landingPage/images/awards/starupwc.png"
                alt="Startup World Cup"
                className="w-full h-16 md:h-20 object-contain"
              />
              <p className="text-gray-300">Startup World Cup</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto w-full relative">
          {/* Recognition Section for Mobile/Tablet - Shows below the CTA card */}
          <div className="mb-8 lg:hidden">
            <h3 className="text-white text-lg sm:text-xl font-medium mb-4 text-center">
              Recognition
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
              <div className="p-3 sm:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-2xl backdrop-blur-lg">
                <img
                  src="/landingPage/images/awards/babal.png"
                  alt="Babal Award"
                  className="w-full h-12 sm:h-16 object-contain mb-2"
                />
                <p className="text-gray-300 text-xs sm:text-sm">
                  Babal Challenge
                </p>
              </div>
              <div className="p-3 sm:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-2xl backdrop-blur-lg">
                <img
                  src="/landingPage/images/awards/ictaward.png"
                  alt="ICT Award"
                  className="w-full h-12 sm:h-16 object-contain mb-2"
                />
                <p className="text-gray-300 text-xs sm:text-sm">ICT Award</p>
              </div>
              <div className="p-3 sm:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-2xl backdrop-blur-lg">
                <img
                  src="/landingPage/images/awards/nyef.png"
                  alt="NYEF"
                  className="w-full h-12 sm:h-16 object-contain mb-2"
                />
                <p className="text-gray-300 text-xs sm:text-sm">NYEF</p>
              </div>
              <div className="p-3 sm:p-4 flex items-center justify-center flex-col bg-[#9A9A9A]/30 rounded-2xl backdrop-blur-lg">
                <img
                  src="/landingPage/images/awards/starupwc.png"
                  alt="Startup World Cup"
                  className="w-full h-12 sm:h-16 object-contain mb-2"
                />
                <p className="text-gray-300 text-xs sm:text-sm">
                  Startup World Cup
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6">
            {/* Navigation Links */}
            <nav className="flex flex-col sm:flex-row items-center md:justify-start gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-xs sm:text-sm">
              <span
                onClick={() => scrollToSection("home")}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Home
              </span>
              <span
                onClick={() => scrollToSection("partners")}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Partners
              </span>
              <span
                onClick={() => scrollToSection("services")}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Our Services
              </span>
              <span
                onClick={() => scrollToSection("why-samparka")}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Why Samparka?
              </span>
              <span
                onClick={() => scrollToSection("pricing")}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </span>
            </nav>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center md:justify-start gap-4 sm:gap-6 md:gap-7 lg:gap-8 mt-6 md:mt-5 lg:mt-6">
            <a
              href="https://www.facebook.com/share/14LWHfWv8Af/?mibextid=LQQJ4d"
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
            </a>
            <a
              href="https://www.instagram.com/samparka.loyalty/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
            </a>
            <a
              href="https://np.linkedin.com/company/samparkacloudloyalty"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Twitter className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
            </a>
            <a
              href="https://np.linkedin.com/company/samparkacloudloyalty"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-12 lg:gap-18 text-center md:text-left mt-6 sm:mt-8 md:mt-14 lg:mt-16 items-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              © Copyright 2025 Samparka.
            </p>
            <a
              href="#"
              className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors underline"
            >
              Privacy Policy
            </a>

            <a
              href="https://www.rocketspace.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 text-xs sm:text-sm hover:text-white transition-colors"
            >
              {" "}
              Designed by @RocketSpace
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
