import React, { useState } from 'react'

const Testimonials = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const integrations = [
    { name: "4 Stories", logo: "/landingPage/images/partners/4stories.png", position: "left-top" },
    { name: "Beyond Trend", logo: "/landingPage/images/partners/beyondtrend.png", position: "top" },
    { name: "Blue Sky", logo: "/landingPage/images/partners/bluesky.jpg", position: "right-top" },
    { name: "Khukuri", logo: "/landingPage/images/partners/khukuri.jpg", position: "left" },
    { name: "Chiya Spot", logo: "/landingPage/images/partners/chiyaspot.png", position: "right" },
    { name: "Maak Ara", logo: "/landingPage/images/partners/maakara.png", position: "bottom-left" },
    { name: "Meso Hot", logo: "/landingPage/images/partners/mesohot.png", position: "bottom" },
    { name: "Le Salon", logo: "/landingPage/images/partners/lesalon.png", position: "bottom-right" }
  ];

  const testimonials = [
    {
      id: 1,
      logo: "/landingPage/images/partners/khukuri.jpg",
      text: "Samparka's platform is incredibly easy to use. Our staff adapted to it within days, and our customers love how simple it is to earn rewards.",
      name: "Khukuri",
    },
    {
      id: 2,
      logo: "/landingPage/images/partners/chiyaspot.png",
      text: "Since implementing Samparka, we've seen a 45% increase in customer retention. The benefits for our business have been phenomenal!",
      name: "Chiya Spot",
    },
    {
      id: 3,
      logo: "/landingPage/images/partners/mesohot.png",
      text: "The Samparka team is always helpful and responsive. Whenever we need support or have questions, they're there to assist us immediately.",
      name: "Mesohot",
     
    },
    {
      id: 4,
      logo: "/landingPage/images/partners/lesalon.png",
      text: "We've saved significant costs by switching to Samparka's digital loyalty system. No more printing cards, and everything is automated!",
      name: "Le Salon",
    
    },
    {
      id: 5,
      logo: "/landingPage/images/partners/beyondtrend.png",
      text: "Our sales have increased by 35% since we started using Samparka. The loyalty program keeps customers coming back for more.",
      name: "Beyond Trend",
      
    },
    {
      id: 6,
      logo: "/landingPage/images/partners/bluesky.jpg",
      text: "Samparka is so easy to use that our entire team was onboarded in just one training session. Highly intuitive and user-friendly!",
      name: "Blue Sky Cafe",
      
    },
    {
      id: 7,
      logo: "/landingPage/images/partners/maakara.png",
      text: "The cost savings have been incredible. We've reduced our loyalty program expenses by 60% while actually improving customer engagement.",
      name: "Maak Ara",
  
    },
    {
      id: 8,
      logo: "/landingPage/images/partners/4stories.png",
      text: "Samparka's support team is always there when we need them. Quick responses, helpful solutions, and genuinely care about our success.",
      name: "4 Stories",
   
    }
  ];

  // Show 4 testimonials at a time
  const testimonialsPerPage = 4;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const currentTestimonials = testimonials.slice(
    currentPage * testimonialsPerPage,
    (currentPage + 1) * testimonialsPerPage
  );

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className='w-full bg-[#F6F4F7] py-8'>
      <div className='flex justify-center md:hidden'>
      <h2 className='font-semibold text-2xl'>Hear What our partners say</h2>
      
      </div>
      <div className='max-w-7xl mx-auto px-4 md:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center'>
          
          {/* Left Side - Solar System Integration */}
          <div className='relative flex items-center justify-center'>
            {/* Main container with orbital circles */}
            <div className='relative w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px] h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] flex items-center justify-center'>
              
              {/* Animated orbital circles */}
              <div className='absolute w-[240px] sm:w-[300px] md:w-[360px] lg:w-[400px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] border border-gray-300 rounded-full'
                style={{ animation: 'constellationRotate 30s linear infinite' }}></div>
              <div className='absolute w-[180px] sm:w-[225px] md:w-[270px] lg:w-[300px] h-[180px] sm:h-[225px] md:h-[270px] lg:h-[300px] border border-gray-300 rounded-full'
                style={{ animation: 'constellationRotate 35s linear infinite reverse' }}></div>
              <div className='absolute w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px] border border-gray-300 rounded-full'
                style={{ animation: 'constellationRotate 40s linear infinite' }}></div>

              {/* Center - Samparka Logo */}
              <div className='absolute w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white rounded-full border-2 border-green-500 p-2 sm:p-3 md:p-4 shadow-lg flex items-center justify-center z-10'>
                <div className='text-center'>
                  <div>
                    <img src="/landingPage/images/logo_black.png" className="w-16 sm:w-20 md:w-24 lg:w-24" alt="Logo" />
                  </div>
                </div>
              </div>

              {/* Orbiting Integration Logos */}
              {/* Outer orbit - 4 logos */}
              <div className='absolute w-[240px] sm:w-[300px] md:w-[360px] lg:w-[400px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 40s linear infinite' }}>
                <div className='absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1.5 sm:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 40s linear infinite reverse' }}>
                    <img src={integrations[0].logo} alt={integrations[0].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

              <div className='absolute w-[240px] sm:w-[300px] md:w-[360px] lg:w-[400px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 40s linear infinite', animationDelay: '-10s' }}>
                <div className='absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1.5 sm:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 40s linear infinite reverse', animationDelay: '-10s' }}>
                    <img src={integrations[1].logo} alt={integrations[1].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

              <div className='absolute w-[240px] sm:w-[300px] md:w-[360px] lg:w-[400px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 40s linear infinite', animationDelay: '-20s' }}>
                <div className='absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1.5 sm:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 40s linear infinite reverse', animationDelay: '-20s' }}>
                    <img src={integrations[2].logo} alt={integrations[2].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

              <div className='absolute w-[240px] sm:w-[300px] md:w-[360px] lg:w-[400px] h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 40s linear infinite', animationDelay: '-30s' }}>
                <div className='absolute w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1.5 sm:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 40s linear infinite reverse', animationDelay: '-30s' }}>
                    <img src={integrations[3].logo} alt={integrations[3].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

              {/* Middle orbit - 2 logos */}
              <div className='absolute w-[180px] sm:w-[225px] md:w-[270px] lg:w-[300px] h-[180px] sm:h-[225px] md:h-[270px] lg:h-[300px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 35s linear infinite reverse' }}>
                <div className='absolute w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1.5 sm:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 35s linear infinite' }}>
                    <img src={integrations[4].logo} alt={integrations[4].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

              <div className='absolute w-[180px] sm:w-[225px] md:w-[270px] lg:w-[300px] h-[180px] sm:h-[225px] md:h-[270px] lg:h-[300px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 35s linear infinite reverse', animationDelay: '-17.5s' }}>
                <div className='absolute w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1.5 sm:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 35s linear infinite', animationDelay: '-17.5s' }}>
                    <img src={integrations[5].logo} alt={integrations[5].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

              {/* Inner orbit - 2 logos */}
              <div className='absolute w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 30s linear infinite' }}>
                <div className='absolute w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1 sm:p-1.5 md:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 30s linear infinite reverse' }}>
                    <img src={integrations[6].logo} alt={integrations[6].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

              <div className='absolute w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                style={{ animation: 'spin 30s linear infinite', animationDelay: '-15s' }}>
                <div className='absolute w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <div className='w-full h-full bg-white rounded-xl border border-gray-200 shadow-md p-1 sm:p-1.5 md:p-2 flex items-center justify-center'
                    style={{ animation: 'spin 30s linear infinite reverse', animationDelay: '-15s' }}>
                    <img src={integrations[7].logo} alt={integrations[7].name} className='w-full h-full object-contain' />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side - Content */}
          <div className='space-y-4  sm:space-y-8'>
            {/* Heading */}
            <div>
              <h2 className='hidden md:block text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4'>
               Hear what our partners say
              </h2>
            </div>

            {/* Testimonials Grid */}
            <div className='grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6'>
              {currentTestimonials.map((testimonial) => (
                <div key={testimonial.id} className='bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
                  <div className='mb-3 sm:mb-4 gap-3 sm:gap-4 flex items-center'>
                    <img src={testimonial.logo} 
                      alt="Partner" className='h-8 sm:h-10 md:h-12 w-auto object-contain' />
                      <div>
                        <div className='font-semibold text-gray-900 text-xs sm:text-sm'>{testimonial.name}</div>
                        <div className='text-[10px] sm:text-xs text-gray-500'>{testimonial.position}</div>
                      </div>
                  </div>
                  <p className='text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4'>
                    "{testimonial.text}"
                  </p>
                 
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className='flex items-center justify-between mt-4 sm:mt-6'>
              <button
                onClick={handlePrev}
                className='flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium text-xs sm:text-sm'
              >
                <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
                <span className='hidden sm:inline'>Previous</span>
                <span className='sm:hidden'>Prev</span>
              </button>

              {/* Page Indicators */}
              <div className='flex gap-1.5 sm:gap-2'>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                      currentPage === index ? 'bg-[#275B43]' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className='flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#275B43] text-white rounded-lg hover:bg-[#15442e] hover:cursor-pointer transition-colors font-medium text-xs sm:text-sm'
              >
                Next
                <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Testimonials
