import React, { useState } from 'react'

const NewSecurity = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    
    const handleCardInteraction = (index) => {
        // Toggle on click for mobile and tablet (< 1024px), set on hover for desktop (>= 1024px)
        if (window.innerWidth < 1024) { // lg breakpoint
            setHoveredIndex(hoveredIndex === index ? null : index)
        } else {
            setHoveredIndex(index)
        }
    }

    const handleMouseLeave = () => {
        // Only clear on mouse leave for desktop (>= 1024px)
        if (window.innerWidth >= 1024) {
            setHoveredIndex(null)
        }
    }

    const whySamparkaFeatures = [
        {
            image: "/landingPage/images/NewSecurity/Boost_Revenue.png",
            title: "Boost Revenue",
            description: "More customers, more sales — turn one-time buyers into loyal repeat customers."
        },
        {
            image: "/landingPage/images/NewSecurity/Eco-Friendly.png",
            title: "Eco-Friendly",
            description: "Digital, paperless, and sustainable loyalty solutions for a greener business."
        },
        {
            image: "/landingPage/images/NewSecurity/Customer_Engagement.png",
            title: "Engagement Engine",
            description: "Keep your brand top-of-mind with your logo directly on your customers' phones."
        }
    ]

    return (
        <div className="pt-16 md:pt-20 bg-[#F6F4F7] relative h-[85vh] w-full">
            {/* Full Screen Blur Background Overlay */}
            {hoveredIndex !== null && (
                <div
                    className="fixed inset-0 z-30 transition-all duration-400 ease-in-out pointer-events-none"
                    style={{
                        background: hoveredIndex === 0
                            ? 'rgba(147, 51, 234, 0.15)' // Purple for Boost Revenue
                            : hoveredIndex === 1
                                ? 'rgba(59, 130, 246, 0.15)' // Blue for Eco-Friendly
                                : 'rgba(239, 68, 68, 0.15)', // Red for Engagement Engine
                        backdropFilter: 'blur(10px)',
                        border: hoveredIndex === 0
                            ? '1px solid rgba(147, 51, 234, 0.3)'
                            : hoveredIndex === 1
                                ? '1px solid rgba(59, 130, 246, 0.3)'
                                : '1px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: hoveredIndex === 0
                            ? '0 8px 40px rgba(147, 51, 234, 0.12), inset 0 1px 0 rgba(147, 51, 234, 0.4)'
                            : hoveredIndex === 1
                                ? '0 8px 40px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(59, 130, 246, 0.4)'
                                : '0 8px 40px rgba(239, 68, 68, 0.12), inset 0 1px 0 rgba(239, 68, 68, 0.4)',
                        WebkitBackdropFilter: 'blur(10px)'
                    }}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-full flex flex-col justify-start gap-0">
                {/* Header */}
                <div className="text-center relative z-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                        Why Samparka?
                    </h2>
                    <p className='text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
                        Boost repeat sales with smart digital rewards. <br className='hidden md:block' />
                        Keep customers coming back with one simple loyalty platform.</p>
                </div>

                {/* Why Samparka Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 relative gap-4 sm:gap-0 items-center ">
                    {whySamparkaFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex flex-col  items-center justify-start text-center group relative ease-in-out ${index === 0 ? 'min-h-[10px] flex flex-col mt-5 md:mt-0' : ''} ${index === 2 ? 'col-span-2 sm:col-span-2 lg:col-span-1  h-full -mb-8' : 'col-span-1'} ${hoveredIndex !== null
                                ? hoveredIndex === index
                                    ? 'z-40 scale-105'
                                    : 'z-10'
                                : 'z-40'
                                }`}
                            style={{
                                transition: 'transform 400ms ease-in-out, z-index 200ms ease-in-out'
                            }}
                        >
                            {/* Overlapping Cards */}
                            <div className="relative mb-4 -mt-30">
                                {index === 1 ? (
                                    // Eco-Friendly Cards (Colored Divs)
                                    <>
                                        <div
                                            className={`absolute w-28 sm:w-40 h-40 sm:h-56 rounded-xl scale-0 ${hoveredIndex === index ? '-top-2 md:-top-5 scale-100 opacity-100 transform -rotate-8 -left-12 sm:-left-18' : 'top-35 left-0 opacity-0 transform rotate-0'}`}
                                            style={{
                                                background: '',
                                                transition: 'all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Eco2.png" alt="" />
                                        </div>
                                        <div
                                            className={`relative w-24 sm:w-36 h-36 sm:h-52 rounded-xl scale-0 ${hoveredIndex === index ? '-top-5 scale-100 opacity-100 transform rotate-6 -right-12 sm:-right-18' : 'top-35 right-0 opacity-0 transform rotate-0'}`}
                                            style={{
                                                background: '',
                                                transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Eco1.png" alt="" />
                                        </div>
                                        <div
                                            className={`absolute w-36 sm:w-50 h-20 sm:h-28 rounded-lg scale-0 -right-14 sm:-right-20 top-20 md:top-30 drop-shadow-2xl ${hoveredIndex === index ? 'scale-100 opacity-100 transform rotate-15' : ' top-50 right-0 opacity-0 transform'}`}
                                            style={{
                                                background: '',
                                                transition: 'all 450ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Eco4.png" alt="" />
                                        </div>
                                        <div className={`absolute w-12 sm:w-16 h-16 sm:h-24 rounded-lg scale-0 md:-right-14 -right-10 -top-18 drop-shadow-2xl ${hoveredIndex === index ? 'scale-100 opacity-100 transform -rotate-12' : ' top-50 right-0 opacity-0 transform'}`}
                                            style={{
                                                background: '',
                                                transition: 'all 550ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}>
                                            <img src="/landingPage/images/newWhySamparka/Eco3.png" alt="" />
                                        </div>
                                    </>
                                ) : index === 2 ? (
                                    // Engagement Engine Cards (Pattern/Shape Divs)
                                    <>
                                        <div
                                            className={`absolute w-28 sm:w-40 rounded-2xl scale-0 ${hoveredIndex === index ? '-top-10 scale-100 opacity-100 transform -rotate-8 -left-12 sm:-left-18' : 'top-35 left-0 opacity-0 transform rotate-0'}`}
                                            style={{
                                                background: '',
                                                
                                                transition: 'all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src='https://res.cloudinary.com/dtxqsnd7b/image/upload/v1760433248/Card5_yhu8dr.webp' alt="" />
                                        </div>
                                        <div
                                            className={`relative w-28 sm:w-40 h-32 sm:h-48 rounded-full shadow-lg scale-0 ${hoveredIndex === index ? '-top-5 scale-100 opacity-100 transform rotate-6 -right-12 sm:-right-18' : 'top-35 right-0 opacity-0 transform rotate-0'}`}
                                            style={{
                                                background: '',
                                                transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Engine2.png" alt="" />
                                        </div>
                                        {/* <div
                                            className={`absolute w-24 h-24 scale-0 -right-10 top-45 drop-shadow-2xl ${hoveredIndex === index ? 'scale-100 opacity-100 transform rotate-45' : ' top-50 right-0 opacity-0 transform'}`}
                                            style={{
                                                background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                                                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                                                transition: 'all 450ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        /> */}
                                        <div
                                            className={`absolute w-50 sm:w-70 scale-0 -right-10 sm:-right-15 -top-20 drop-shadow-2xl ${hoveredIndex === index ? 'scale-100 opacity-100 transform ' : ' top-50 right-0 opacity-0 transform'}`}
                                            style={{
                                                background: '',
                                                transition: 'all 550ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Engine3.png" alt="" />
                                        </div>
                                    </>
                                ) : (
                                    // Default Cards (Images for Boost Revenue only)
                                    <>
                                        <div
                                            className={`absolute w-28 sm:w-44 scale-0 ${hoveredIndex === index ? '-top-2 scale-100 opacity-100 transform -rotate-8 -left-12 sm:-left-18' : 'top-35 left-0 opacity-0 transform rotate-0'}`}
                                            style={{
                                                transition: 'all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Boost1.png" alt="" />
                                        </div>
                                        <div
                                            className={`relative w-24 sm:w-40 shadow-lg scale-0 ${hoveredIndex === index ? '-top-5 scale-100 opacity-100 transform rotate-6 -right-12 sm:-right-18' : 'top-35 right-0 opacity-0 -bg-linear-90  transform rotate-0'}`}
                                            style={{
                                                transition: 'all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Boost2.png" alt="" />
                                        </div>
                                        <div
                                            className={`absolute w-12 sm:w-12 scale-0 -right-14 sm:-right-10 md:top-45 top-25 drop-shadow-2xl ${hoveredIndex === index ? 'scale-100 opacity-100 transform' : ' top-50 right-0 opacity-0 transform'}`}
                                            style={{
                                                transition: 'all 450ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Boost3.png" alt="" />
                                        </div>
                                        <div
                                            className={`absolute w-12 sm:w-10 scale-0 -right-14 sm:-right-20 -top-10 drop-shadow-2xl ${hoveredIndex === index ? 'scale-100 opacity-100 transform' : ' top-50 right-0 opacity-0 transform'}`}
                                            style={{
                                                transition: 'all 550ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                            }}
                                        >
                                            <img src="/landingPage/images/newWhySamparka/Boost4.png" alt="" />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Icon Container */}
                            <div
                                className="mb-4 sm:mb-6 cursor-pointer relative z-50"
                                onClick={() => handleCardInteraction(index)}
                                onMouseEnter={() => window.innerWidth >= 1024 && setHoveredIndex(index)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className={`w-16 sm:w-24 h-16 sm:h-24 mx-auto object-contain transition-transform duration-400 ${hoveredIndex === index ? 'transform scale-75' : ''
                                        }`}
                                />
                            </div>

                            {/* Title */}
                            <h3 className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-md md:text-lg font-medium text-gray-700 mb-2 transition-all duration-400 ${hoveredIndex === index
                                ? 'bg-transparent text-base sm:text-lg md:text-xl font-semibold'
                                : 'bg-[#F3F3F3]'
                                }`}>
                                {feature.title}
                            </h3>

                            {/* Description */}
                            {hoveredIndex === index && (
                                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed px-2 sm:px-0">
                                    {feature.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default NewSecurity