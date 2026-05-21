import React, { useEffect } from 'react'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FloatingCards = () => {

    useEffect(() => {
        const cards = document.querySelectorAll('.floating-card');
        const heroContent = document.querySelector('.hero-content');

        // Scroll control utilities
        const toggleScroll = (disable) => {
            document.body.style.overflow = disable ? 'hidden' : '';
            document.body.style.position = disable ? 'fixed' : '';
            document.body.style.top = disable ? '0' : '';
            document.body.style.left = disable ? '0' : '';
            document.body.style.width = disable ? '100%' : '';
        };

        // Card position configuration based on screen size
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 640;
        const isTablet = screenWidth >= 640 && screenWidth < 1024;
        const isDesktop = screenWidth >= 1024;

        let cardPositions;

        if (isMobile) {
            // Mobile positions (< 640px) - centered with rotation 0
            cardPositions = [
                { x: 0, y: 40, rotation: -18 }, // red - centered above
                { x: 0, y: 40, rotation: -40 }, // purple - centered above
                { x: 0, y: 40, rotation: 5 },  // white - centered below
                { x: 0, y: 40, rotation: 35 }   // green - centered below
            ];
        } else if (isTablet) {
            // Tablet positions (640px - 1024px)
            cardPositions = [
                { x: -220, y: -180, rotation: 15 }, // top-right (medium distance)
                { x: 240, y: -160, rotation: -20 }, // top-left (medium distance)
                { x: -200, y: 160, rotation: 10 },  // bottom-left (medium distance)
                { x: 220, y: 180, rotation: -15 }   // bottom-right (medium distance)
            ];
        } else {
            // Desktop positions (>= 1024px)
            cardPositions = [
                { x: -300, y: -150, rotation: 15 }, // top-right (far)
                { x: 300, y: -100, rotation: -20 }, // top-left (far)
                { x: -250, y: 200, rotation: 10 },  // bottom-left (far)
                { x: 350, y: 250, rotation: -15 }   // bottom-right (far)
            ];
        }

        // Start with scroll disabled
        toggleScroll(true);

        // Set initial card positions and animate
        const timeline = gsap.timeline({
            onComplete: () => {
                toggleScroll(false);

                // Setup scroll-triggered animations with responsive settings
                if (cards.length > 0) {
                    // Responsive scroll distances and positions
                    let scrollEnd, topPosition;

                    if (isMobile) {
                        scrollEnd = '+=300vh';
                        topPosition = '50%';
                    } else if (isTablet) {
                        scrollEnd = '+=350vh';
                        topPosition = '37%';
                    } else {
                        scrollEnd = '+=380vh';
                        topPosition = '35%';
                    }

                    gsap.to(cards, {
                        left: '50%',
                        top: topPosition,
                        transform: 'translate(-50%, -50%)',
                        transformOrigin: 'bottom center',
                        scrollTrigger: {
                            trigger: heroContent,
                            start: 'top',
                            end: scrollEnd,
                            scrub: 1,
                            // markers: true,
                            onUpdate: (self) => {
                                // Responsive scale animation
                                const scaleReduction = isMobile ? 0.6 : isTablet ? 0.65 : 0.7;
                                const minScale = isMobile ? 0.4 : isTablet ? 0.35 : 0.3;
                                const scaleValue = 1 - (self.progress * scaleReduction);

                                gsap.set(cards, {
                                    scale: Math.max(scaleValue, minScale),
                                    opacity: self.progress === 1 ? 0 : 1
                                });
                            }
                        }
                    });
                }
            }
        });

        // Animate cards
        cards.forEach((card, index) => {
            // Fallback position with responsive values
            let fallbackPos;
            if (isMobile) {
                fallbackPos = { x: 0, y: 0, rotation: 0 };
            } else if (isTablet) {
                fallbackPos = { x: -200, y: -140, rotation: 0 };
            } else {
                fallbackPos = { x: -300, y: -150, rotation: 0 };
            }

            const pos = cardPositions[index] || fallbackPos;

            gsap.set(card, {
                x: pos.x,
                y: pos.y,
                scale: 0.9,
                rotation: pos.rotation,
                opacity: 1,
                transformOrigin: 'bottom center'
            });

            timeline.to(card, {
                x: 0,
                y: 0,
                scale: 1,
                rotation: pos.rotation,
                duration: 2,
                ease: 'power2.out',
                transformOrigin: 'bottom center'
            }, index * 0.15 + 1);
        });

        return () => toggleScroll(false);
    }, []);

    return (
        <div className='absolute inset-0 w-full h-full pointer-events-none z-0'>
            {/* floating cards */}
            {[
                {
                    //red
                    src: 'https://res.cloudinary.com/dtxqsnd7b/image/upload/v1760433250/Card3_dmlf4e.webp',
                    className: 'z-10 left-1/2 -translate-x-1/2 sm:rotate-30 top-[0vh] sm:top-[0vh] md:-top-[45vh] lg:-top-[80vh] md:right-[1vw] lg:right-[2vw] sm:left-auto sm:translate-x-0 sm:translate-y-0'
                },
                {
                    //purple
                    src: 'https://res.cloudinary.com/dtxqsnd7b/image/upload/v1760433249/Card2_mnrcuy.webp',
                    className: 'z-0 left-1/2 -translate-x-1/2 sm:-rotate-20 top-[0vh] sm:top-[0vh] md:-top-[50vh] lg:-top-[75vh]  md:left-[1vw] lg:left-[2vw] sm:translate-x-0 sm:translate-y-0'
                },
                {
                    //white
                    src: 'https://res.cloudinary.com/dtxqsnd7b/image/upload/v1760433248/Card5_yhu8dr.webp',
                    className: 'z-20 left-1/2 -translate-x-1/2 sm:rotate-152 top-[0vh] sm:top-[0vh] md:-top-[15vh] lg:-top-[25vh]  md:left-[3vw] lg:left-[14vw] sm:translate-x-0 sm:translate-y-0'
                },
                {
                    //green
                    src: 'https://res.cloudinary.com/dtxqsnd7b/image/upload/v1760433247/Card1_z2ebqc.webp',
                    className: 'z-30 left-1/2 -translate-x-1/2 sm:-rotate-100 md:-rotate-120 lg:-rotate-120 top-[0vh] sm:top-[0vh] md:-top-[15vh] lg:-top-[30vh]  md:right-[3vw] lg:right-[12vw] sm:left-auto sm:translate-x-0 sm:translate-y-0'
                }
            ].map((card, index) => (
                <div
                    key={index}
                    className={`floating-card absolute w-32 sm:h-32 sm:w-32 md:h-36 md:w-40 lg:h-40 lg:w-44 rounded-lg ${card.className}`}
                    style={{
                                willChange: 'transform',
                                transformStyle: 'preserve-3d',
                                transformOrigin: 'bottom center'
                            }}
                >
                    <img className='w-full' src={card.src} alt={`Loyalty card ${index + 1}`} />
                </div>
            ))}
        </div>
    )
}

export default FloatingCards