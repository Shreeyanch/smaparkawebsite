import React, { useState, useEffect } from 'react';

const Award = () => {
  const [visibleAwards, setVisibleAwards] = useState([]);

  const awards = [
    {
      id: 1,
      date: "Jan 11, 2025",
      title: "40 Under 40 Entrepreneurs",
      description: "Recognized as one of Nepal's \"40 Under 40 Entrepreneurs\" by Nepal Investment Bank Limited and Ace Capital.",
      category: "Leadership",
      icon: "🏆",
      color: "from-yellow-400/20 to-orange-400/10"
    },
    {
      id: 2,
      date: "Feb 27, 2025",
      title: "Top 20 Startups - NYEF Competition",
      description: "Selected among the Top 20 Startups in the NYEF (Nepalese Young Entrepreneurs' Forum) All-Nepal Best Startup Competition.",
      category: "Competition",
      icon: "🥇",
      color: "from-blue-400/20 to-cyan-400/10"
    },
    {
      id: 3,
      date: "Apr 28, 2025",
      title: "Top 10 Finalists - Startup World Cup Nepal",
      description: "Reached the Top 10 Finalists in the Startup World Cup Nepal, organized by Pegasus Tech Ventures.",
      category: "Global Recognition",
      icon: "🌟",
      color: "from-purple-400/20 to-pink-400/10"
    },
    {
      id: 4,
      date: "Jun 20, 2025",
      title: "Top 3 - Babal Entrepreneurship Challenge",
      description: "Secured a Top 3 position in the Babal Entrepreneurship Challenge (Kings College, Rs20 lakh seed funding round) and was approached by Team Ventures Capital.",
      category: "Funding",
      icon: "💎",
      color: "from-green-400/20 to-emerald-400/10"
    },
    {
      id: 5,
      date: "2025",
      title: "ICT Award 2025 Nomination",
      description: "Nominated in the Startup Category at Nepal's most prestigious technology award.",
      category: "Technology",
      icon: "🚀",
      color: "from-indigo-400/20 to-violet-400/10"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleAwards(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.award-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
       <div className='h-auto w-full px-8 md:mb-20 bg-gray-50 flex flex-col md:flex-row lg:flex-row  justify-between sm:px-10 md:px-16 lg:px-20 py-10 md:py-8 gap-8 md:gap-4 lg:gap-0'>
                {/* Left Side - Heading Text Section */}
                <div className="max-w-md w-full md:w-auto lg:w-auto">
                    {/* Crown Scribble */}
                    <div className="">
                        <img 
                            src="/landingPage/images/scribble/crown.png" 
                            alt="Crown" 
                            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain"
                        />
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#202020] mb-6" >
                        
                            Awarded By Experts for the innovation

                    </h2>
              
                </div>


<div className='hidden md:block lg:block'>
   <img src="/landingPage/images/scribble/arrow.png" className='w-64 md:w-80 lg:w-96 transform scale-y-[-1] -rotate-30' alt="" />
</div>
                {/* Right Side - Awards Section */}
                <div className="flex flex-col items-center w-full md:w-auto lg:w-auto">
                    <div className="flex items-end gap-1 m-2 md:m-3 lg:m-4 relative flex-wrap md:flex-nowrap lg:flex-nowrap justify-center">
                        <div className="hidden md:block lg:block">
                            <img src="/landingPage/images/scribble/stars.png" alt="" className='w-12 md:w-16 lg:w-auto'/>
                        </div>
                        {/* {"Recognized for Excellence".split("").map((letter, i) => {
                            if (letter === " ") return <span key={i} className="w-1 md:w-1.5 lg:w-2"></span>;
                            // Create arc position for text - same formula as stars
                            const totalLetters = "Recognized for Excellence".replace(/\s/g, "").length;
                            const letterIndex = "Recognized for Excellence".substring(0, i).replace(/\s/g, "").length;
                            const arcOffset = Math.sin((letterIndex / (totalLetters - 1)) * Math.PI) * 20; // 8px max offset for text
                            return (
                                <span
                                    key={i}
                                    className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-black"
                                    style={{
                                        transform: `translateY(-${arcOffset}px)`,
                                        display: 'inline-block'
                                    }}
                                >
                                    {letter}
                                </span>
                            );
                        })} */}
                    </div>
               
                    
                    {/* Awards Row */}
                    <div className="flex gap-3 sm:gap-4 md:gap-3 lg:gap-6 justify-center flex-wrap md:flex-nowrap lg:flex-nowrap">
                        {[
                            {
                                image: "/landingPage/images/awards/nyef.png",
                                title: "Top 20 NYEF",
                                org: "National Competition",
                                alt: "NYEF Award"
                            },
                            {
                                image: "/landingPage/images/awards/startupwc.png",
                                title: "Startup World Cup",
                                org: "Top 10 Finalists",
                                alt: "Startup World Cup Award"
                            },
                            {
                                image: "/landingPage/images/awards/babal.png",
                                title: "Babal Challenge",
                                org: "Top 3 Position",
                                alt: "Babal Entrepreneurship Challenge"
                            },
                            {
                                image: "/landingPage/images/awards/ictaward.png",
                                title: "ICT Award",
                                org: "Tech Category",
                                alt: "ICT Award Nepal"
                            }
                        ].map((award, index) => (
                            <div
                                key={index}
                                className="group"
                            >
                                <div className="flex flex-col items-center gap-3 md:gap-2.5 lg:gap-4 p-4 sm:p-5 md:p-3 lg:p-6 bg-white rounded-2xl md:rounded-xl lg:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 w-36 sm:w-40 md:w-32 lg:w-44 h-48 sm:h-52 md:h-44 lg:h-56">
                                    {/* Award Image Container - Rounded like profile picture */}
                                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-14 md:h-14 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-lg lg:rounded-2xl flex items-center justify-center p-2 md:p-1.5 lg:p-3">
                                        <img 
                                            src={award.image} 
                                            alt={award.alt}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    
                                    {/* Award Title with verification-style badge */}
                                    <div className="text-center flex-1 flex flex-col justify-center">
                                        <div className="flex items-center justify-center gap-1 mb-2 md:mb-1">
                                            <h4 className="font-semibold text-[#202020] text-sm md:text-xs lg:text-base leading-tight">
                                                {award.title}
                                            </h4>
                                            <svg className="w-3 h-3 md:w-2.5 md:h-2.5 lg:w-4 lg:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        
                                        {/* Organization description - subtle gray text */}
                                        {/* <p className="text-xs md:text-[10px] lg:text-sm text-gray-500 leading-tight">
                                            {award.org}
                                        </p> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
  );
};

export default Award;
