import React, { useState, useEffect } from 'react'

const Security = () => {
  const [currentSection, setCurrentSection] = useState(0);

  // Define content that will appear in the phone
  const phoneContent = [
    {
      id: 0,
      title: "TLS/SSL Certificate",
      description: "TLS/SSL encryption protects your data in transit, keeping it safe from unauthorized access.",
      icon: "📑",
      bgColor: "bg-[#F5D2D2]"
    },
    {
      id: 1,
      title: "AWS/Google Cloud", 
      description: "Our cloud infrastructure on AWS and Google Cloud ensures reliable data protection and high performance.",
      icon: "☁️",
      bgColor: "bg-[#F8F7CA]"
    },
    {
      id: 2,
      title: "Data Encryption",
      description: "All sensitive data is encrypted both in transit and at rest, ensuring that only authorized parties can access it.",
      icon: "🔐", 
      bgColor: "bg-[#BDE3C3]"
    },
    {
      id: 3,
      title: "Secure Authentication",
      description: "Multi-factor authentication and secure login protocols protect your account from unauthorized access.",
      icon: "🛡️",
      bgColor: "bg-[#A3CCDA]"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Check if content sections exist (desktop) or are hidden (mobile)
      const contentSections = document.querySelectorAll('.content-section');
      const firstSection = contentSections[0];
      const isMobile = !firstSection || window.getComputedStyle(firstSection.parentElement).display === 'none';
      
      if (isMobile) {
        // On mobile, calculate section based on scroll progress through the security component
        const securityContainer = document.querySelector('.security-container');
        if (securityContainer) {
          const containerTop = securityContainer.offsetTop;
          const containerHeight = securityContainer.offsetHeight;
          
          // Calculate progress through the security section (0 to 1)
          let scrollProgress = (scrollPosition - containerTop + windowHeight * 0.5) / (containerHeight - windowHeight);
          scrollProgress = Math.max(0, Math.min(1, scrollProgress));
          
          // Create "sticky" sections - each section takes up 1/4 of the scroll range
          // Add some overlap to make transitions smoother
          let sectionIndex = 0;
          if (scrollProgress < 0.25) {
            sectionIndex = 0;
          } else if (scrollProgress < 0.5) {
            sectionIndex = 1;
          } else if (scrollProgress < 0.75) {
            sectionIndex = 2;
          } else {
            sectionIndex = 3;
          }
          
          setCurrentSection(sectionIndex);
        }
      } else {
        // On desktop/tablet, use content sections for scroll detection
        let activeIndex = 0;
        
        contentSections.forEach((section, index) => {
          const sectionTop = section.offsetTop;
          
          // Check if the section is in view (considering the center of the viewport)
          if (scrollPosition >= sectionTop - windowHeight / 2) {
            activeIndex = index;
          }
        });
        
        setCurrentSection(activeIndex);
      }
    };

    // Initial call to set the correct section
    setTimeout(handleScroll, 100);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [phoneContent.length]);

  return (
    <div className='w-full flex flex-col md:flex-row security-container min-h-[300vh] md:min-h-0'>
      {/* Sticky Phone Section */}
      <div className='w-full md:w-1/2 h-screen sticky top-0 flex items-center justify-center'>
        <div className='relative w-64 h-[500px] sm:w-72 sm:h-[550px] md:w-80 md:h-[600px]'>
          {/* Phone Frame */}
          <div className='absolute inset-0 bg-black rounded-[3rem] p-2'>
            <div className='w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative'>
              {/* Phone Content */}
              <div className={`w-full h-full transition-all duration-500 ease-in-out ${phoneContent[currentSection].bgColor} relative overflow-hidden`}>
                
                {/* Status Bar - Simplified */}
                <div className='flex justify-between items-center px-4 sm:px-6 pt-3 sm:pt-4 pb-2'>
                  <div className='flex items-center space-x-1 sm:space-x-2'>
                    <div className='w-6 h-6 sm:w-8 sm:h-8 bg-black rounded-full flex items-center justify-center'>
                      <span className='text-white text-xs font-bold'>S</span>
                    </div>
                    <span className='text-gray-600 text-xs sm:text-sm font-medium'>samparka</span>
                  </div>
                  <span className='text-gray-600 text-xs sm:text-sm font-medium'>2h</span>
                </div>

                {/* Progress Bar */}
                <div className='px-4 sm:px-6 pb-3 sm:pb-4'>
                  <div className='flex space-x-1 sm:space-x-2'>
                    {phoneContent.map((_, index) => (
                      <div 
                        key={index}
                        className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                          index === currentSection 
                            ? 'bg-black' 
                            : index < currentSection 
                              ? 'bg-gray-400' 
                              : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className='text-center mt-2'>
                    <span className='text-xs text-gray-500 font-medium'>
                      {currentSection + 1} of {phoneContent.length}
                    </span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className='flex-1 flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8'>
                  
                  {/* Main Title */}
                  <div className='text-center mb-4 sm:mb-6 md:mb-8'>
                    <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-black leading-tight mb-2'>
                      {currentSection === 0 && 'Secure your'}
                      {currentSection === 1 && 'Create your'}
                      {currentSection === 2 && 'Encrypt your'}
                      {currentSection === 3 && 'Protect your'}
                    </h1>
                    <div className='inline-block'>
                      <div className='bg-white border-2 border-black rounded-full px-2 sm:px-3 md:px-4 py-1 shadow-lg transform rotate-3'>
                        <span className='text-black font-bold text-sm sm:text-base md:text-lg'>
                          {currentSection === 0 && '🔒 data'}
                          {currentSection === 1 && '☁️ cloud'}
                          {currentSection === 2 && '🔐 files'}
                          {currentSection === 3 && '🛡️ account'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cute Illustration */}
                  <div className='mb-6 sm:mb-8 md:mb-12'>
                    {currentSection === 0 && (
                      // SSL/TLS Certificate illustration
                      <div className='relative'>
                        <svg width="120" height="90" viewBox="0 0 160 120" className='drop-shadow-lg sm:w-[140px] sm:h-[105px] md:w-[160px] md:h-[120px]'>
                          {/* Certificate/Document */}
                          <rect x="30" y="20" width="100" height="80" fill="white" stroke="#000" strokeWidth="3" rx="8"/>
                          <rect x="40" y="35" width="80" height="4" fill="#000" rx="2"/>
                          <rect x="40" y="45" width="60" height="3" fill="#666" rx="1"/>
                          <rect x="40" y="55" width="70" height="3" fill="#666" rx="1"/>
                          
                          {/* Lock icon */}
                          <rect x="65" y="65" width="30" height="20" fill="#4ade80" stroke="#000" strokeWidth="2" rx="4"/>
                          <path d="M70 65 V60 C70 55, 75 50, 80 50 C85 50, 90 55, 90 60 V65" 
                                stroke="#000" strokeWidth="2" fill="none"/>
                          <circle cx="80" cy="75" r="3" fill="#000"/>
                          
                          {/* Cute face */}
                          <circle cx="45" cy="30" r="2" fill="#000"/>
                          <circle cx="55" cy="30" r="2" fill="#000"/>
                          <path d="M48 35 Q50 37, 52 35" stroke="#000" strokeWidth="1.5" fill="none"/>
                        </svg>
                      </div>
                    )}
                    
                    {currentSection === 1 && (
                      // Cloud illustration (similar to the image)
                      <div className='relative'>
                        <svg width="150" height="90" viewBox="0 0 200 120" className='drop-shadow-lg sm:w-[175px] sm:h-[105px] md:w-[200px] md:h-[120px]'>
                          {/* Two cloud characters */}
                          {/* Left cloud */}
                          <path d="M20 80 C20 70, 30 60, 45 60 C50 50, 65 50, 70 60 C80 60, 90 70, 90 80 C90 90, 80 95, 70 95 L45 95 C30 95, 20 90, 20 80Z" 
                                fill="white" stroke="#000" strokeWidth="3"/>
                          {/* Left cloud face */}
                          <circle cx="45" cy="75" r="2" fill="#000"/>
                          <circle cx="55" cy="75" r="2" fill="#000"/>
                          <path d="M47 82 Q50 85, 53 82" stroke="#000" strokeWidth="2" fill="none"/>
                          {/* Left cloud legs */}
                          <rect x="42" y="95" width="6" height="15" fill="#000" rx="3"/>
                          <rect x="52" y="95" width="6" height="15" fill="#000" rx="3"/>
                          
                          {/* Right cloud */}
                          <path d="M110 80 C110 70, 120 60, 135 60 C140 50, 155 50, 160 60 C170 60, 180 70, 180 80 C180 90, 170 95, 160 95 L135 95 C120 95, 110 90, 110 80Z" 
                                fill="white" stroke="#000" strokeWidth="3"/>
                          {/* Right cloud face - winking */}
                          <circle cx="135" cy="75" r="2" fill="#000"/>
                          <path d="M143 73 L147 75 L143 77" stroke="#000" strokeWidth="2" fill="none"/>
                          <path d="M137 82 Q140 85, 143 82" stroke="#000" strokeWidth="2" fill="none"/>
                          {/* Right cloud legs */}
                          <rect x="132" y="95" width="6" height="15" fill="#000" rx="3"/>
                          <rect x="142" y="95" width="6" height="15" fill="#000" rx="3"/>
                        </svg>
                      </div>
                    )}
                    
                    {currentSection === 2 && (
                      // Data Encryption illustration
                      <div className='relative'>
                        <svg width="135" height="90" viewBox="0 0 180 120" className='drop-shadow-lg sm:w-[157px] sm:h-[105px] md:w-[180px] md:h-[120px]'>
                          {/* Folder */}
                          <path d="M20 40 L60 40 L70 30 L160 30 L160 90 L20 90 Z" 
                                fill="white" stroke="#000" strokeWidth="3"/>
                          
                          {/* Lock on folder */}
                          <rect x="80" y="50" width="40" height="30" fill="#8b5cf6" stroke="#000" strokeWidth="2" rx="6"/>
                          <path d="M85 50 V45 C85 35, 95 25, 100 25 C105 25, 115 35, 115 45 V50" 
                                stroke="#000" strokeWidth="2" fill="none"/>
                          <circle cx="100" cy="65" r="4" fill="#000"/>
                          
                          {/* Cute face on folder */}
                          <circle cx="45" cy="55" r="2" fill="#000"/>
                          <circle cx="55" cy="55" r="2" fill="#000"/>
                          <path d="M47 65 Q50 68, 53 65" stroke="#000" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                    )}
                    
                    {currentSection === 3 && (
                      // Authentication illustration  
                      <div className='relative'>
                        <svg width="120" height="90" viewBox="0 0 160 120" className='drop-shadow-lg sm:w-[140px] sm:h-[105px] md:w-[160px] md:h-[120px]'>
                          {/* Shield */}
                          <path d="M80 20 L80 20 C90 25, 110 30, 120 35 L120 60 C120 75, 100 90, 80 95 C60 90, 40 75, 40 60 L40 35 C50 30, 70 25, 80 20Z" 
                                fill="white" stroke="#000" strokeWidth="3"/>
                          
                          {/* Shield face */}
                          <circle cx="70" cy="50" r="3" fill="#000"/>
                          <circle cx="90" cy="50" r="3" fill="#000"/>
                          <path d="M72 65 Q80 70, 88 65" stroke="#000" strokeWidth="2" fill="none"/>
                          
                          {/* Checkmark */}
                          <path d="M65 40 L75 35 L95 30" stroke="#22c55e" strokeWidth="3" fill="none"/>
                          <path d="M95 30 L85 40 L75 35" stroke="#22c55e" strokeWidth="3" fill="none"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Text */}
                <div className='px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 text-center'>
                  <h2 className='text-base sm:text-lg md:text-xl font-bold text-black mb-2'>
                    {currentSection === 0 && "IT'S SECURE & SAFE!"}
                    {currentSection === 1 && "IT'S EASY AS PIE!"}
                    {currentSection === 2 && "IT'S ENCRYPTED & PRIVATE!"}
                    {currentSection === 3 && "IT'S PROTECTED & VERIFIED!"}
                  </h2>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections - Hidden on mobile */}
      <div className='hidden md:block w-full md:w-1/2'>
        {phoneContent.map((content, index) => (
          <div key={content.id} className='content-section min-h-screen flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16'>
            <div className='max-w-md w-full'>
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full ${content.bgColor} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 border-2 border-gray-800`}>
                <span className='text-lg sm:text-xl md:text-2xl font-bold text-gray-800'>{index + 1}</span>
              </div>
              <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-5 md:mb-6'>{content.title}</h2>
              <p className='text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-7 md:mb-8'>{content.description}</p>
              <div className='space-y-3 sm:space-y-4 text-gray-700'>
                {index === 0 && (
                  <>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#d4999c] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>256-bit SSL encryption for all data transfers</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#d4999c] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Industry-standard security protocols</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#d4999c] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Real-time threat detection and prevention</span>
                    </div>
                  </>
                )}
                {index === 1 && (
                  <>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#e6e076] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Enterprise-grade cloud infrastructure</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#e6e076] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Auto-scaling and load balancing</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#e6e076] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Global CDN for optimal performance</span>
                    </div>
                  </>
                )}
                {index === 2 && (
                  <>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#7cb88a] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>End-to-end encryption for all data</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#7cb88a] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Encrypted database storage</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#7cb88a] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>GDPR and SOC 2 compliant</span>
                    </div>
                  </>
                )}
                {index === 3 && (
                  <>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#6ba0b4] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Two-factor authentication (2FA)</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#6ba0b4] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Biometric authentication support</span>
                    </div>
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <div className='w-2 h-2 bg-[#6ba0b4] rounded-full flex-shrink-0'></div>
                      <span className='text-sm sm:text-base'>Advanced fraud detection algorithms</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Security
