import React, { useRef, useState } from 'react'

const Partners = () => {
  // Array of partner images
  const partnerImages = [
    '/landingPage/images/partners/4stories.png',
    '/landingPage/images/partners/beyondtrend.png',
    '/landingPage/images/partners/bluesky.png',
    '/landingPage/images/partners/caffeeophillia.jpg',
    '/landingPage/images/partners/chiyaspot.png',
    '/landingPage/images/partners/cinemengarden.png',
    '/landingPage/images/partners/cafecucina.jpg',
    '/landingPage/images/partners/bonumcha.jpg',
    '/landingPage/images/partners/mendo.png',
    '/landingPage/images/partners/enspace.jpg',
    '/landingPage/images/partners/gaming.png',
    '/landingPage/images/partners/hotel-ambasador.png',
    '/landingPage/images/partners/hotelcrowne.png',
    '/landingPage/images/partners/jammys.png',
    '/landingPage/images/partners/khukuri.jpg',
    '/landingPage/images/partners/lesalon.png',
    '/landingPage/images/partners/maakara.png',
    '/landingPage/images/partners/makkuse.png',
    '/landingPage/images/partners/mesohot.png',
    '/landingPage/images/partners/mira.jpg',
    '/landingPage/images/partners/newbarber.png',
    
  ];

  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.animationPlayState = 'paused';
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.animationPlayState = 'running';
    }
  };

  return (
    <section className="py-16  overflow-hidden w-full ">
      <div className=" ">
        {/* Section Header */}
        <div className="text-center mb-14 mx-auto  w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Trusted Partners
          </h2>
        </div>

        {/* Infinite Scrolling Partners */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradient overlays for smooth edge effect */}
          <div className="absolute left-0 top-0 w-40 h-full bg-gradient-to-r from-[#F6F4F7] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-40 h-full bg-gradient-to-l from-[#F6F4F7] to-transparent z-10"></div>
          
          {/* Scrolling container */}
          <div 
            ref={scrollContainerRef}
            className="flex whitespace-nowrap"
            style={{
              animation: 'scroll 40s linear infinite',
              width: 'max-content'
            }}
          >
            {/* First set of images */}
            {partnerImages.concat(partnerImages).map((image, index) => (
              <div
                key={index}
                className="inline-flex flex-shrink-0 mx-6"
              >
                <img
                  src={image}
                  alt={`Partner ${(index % partnerImages.length) + 1}`}
                  className="w-32 grayscale h-20 md:w-40 md:h-24 object-contain hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global CSS Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `
      }} />
    </section>
  )
}

export default Partners
