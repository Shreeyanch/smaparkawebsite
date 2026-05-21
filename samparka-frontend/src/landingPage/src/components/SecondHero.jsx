import React, { useState, useEffect, useRef } from 'react'

const SecondHero = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        } else {
          setIsVisible(false) // Reset animation when section leaves viewport
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
        rootMargin: '0px 0px -100px 0px' // Start animation slightly before fully in view
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <div ref={sectionRef} className='min-h-screen sm:min-h-0 md:min-h-screen w-full bg-[#F6F4F7] flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 md:px-16 lg:px-20 py-16 lg:py-0 gap-8 lg:gap-0'>
      {/* Text Content */}
      <div className='w-full lg:w-auto text-center lg:text-left'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-[4vw] text-gray-800 font-medium leading-tight md:leading-tight lg:leading-[5vw] '>Boost <span className='bg-green-600 text-white px-3 sm:px-4 rounded-md'>Loyalty</span></h1>
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-[4vw] text-gray-800 font-medium leading-tight md:leading-tight lg:leading-[5vw] '>Build Relationships</h1>
        <p className='mt-4 text-sm sm:text-base md:text-lg text-gray-800 max-w-md mx-auto lg:mx-0'>Access real-time insights into your loyalty activity, helping you to better understand your customers and their behaviour.</p>

        {/* Book a Demo CTA Button */}
        <button className='mt-6 sm:mt-8 pl-4 sm:pl-5 md:pl-6 pr-2 sm:pr-2.5 md:pr-3 py-1.5 sm:py-2 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-800 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-2 sm:gap-3 md:gap-4 overflow-hidden  transition-transform duration-200 cursor-pointer group hover:scale-105'
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
                `
          }}>
          <span className='text-sm sm:text-base md:text-md font-medium text-white'>Book a demo</span>
          <div className='w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300'>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className='text-black sm:w-[14px] sm:h-[14px] md:w-4 md:h-4'
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

      {/* Image Section */}
      <div className='relative w-full lg:w-auto flex items-center justify-center'>
        <div 
          className={`max-w-[200px] sm:max-w-[250px] md:max-w-xs lg:max-w-sm w-full absolute left-1/2 -translate-x-1/2 top-10 sm:top-20 md:top-32 lg:top-40 transition-all duration-700 ease-bounce ${
            isVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-0 translate-y-8'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            WebkitBackdropFilter: 'blur(25px)'
          }}
        >
          <img 
            src="/landingPage/images/secondhero/popup.png" 
            alt="" 
            className="w-full h-auto"
          />
        </div>
        <img 
          src="/landingPage/images/secondhero/SecondHero.png" 
          alt="" 
          className='w-full max-w-[280px] sm:max-w-sm md:max-w-xl lg:max-w-none lg:w-[45vw]' 
        />
      </div>
    </div>
  )
}

export default SecondHero