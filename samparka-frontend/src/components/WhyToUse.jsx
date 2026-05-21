import React, { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WhyToUse = () => {
    useEffect(() => {
        const cards = gsap.utils.toArray('.why-card')
        
        // Set all cards to visible initially
        gsap.set(cards, { opacity: 1 })
        
        // Split text into individual letters and wrap them in spans
        const splitText = (element) => {
            const text = element.textContent
            element.innerHTML = ''
            
            text.split('').forEach((char, index) => {
                const span = document.createElement('span')
                span.textContent = char === ' ' ? '\u00A0' : char // Use non-breaking space for spaces
                span.style.display = 'inline-block'
                span.classList.add('letter')
                element.appendChild(span)
            })
        }
        
        // Split the main title text
        const mainTitle = document.querySelector('.main-title')
        if (mainTitle) {
            splitText(mainTitle)
            
            // Animate each letter with stagger effect
            const letters = mainTitle.querySelectorAll('.letter')
            
            gsap.set(letters, { y: 100, opacity: 0 })
            
            gsap.to(letters, {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
                stagger: 0.05, // 0.05 second delay between each letter
                scrollTrigger: {
                    trigger: '.main-title',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            })
        }
        
        cards.forEach((card, index) => {
            if (index < cards.length - 1) {
                const nextCard = cards[index + 1]
                
                // Fade out current card when next card comes up
                ScrollTrigger.create({
                    trigger: nextCard,
                    start: 'top 40%',
                    end: 'top 20%',
                    scrub: 1,
                    onUpdate: (self) => {
                        // Fade out the entire current card
                        gsap.to(card, { opacity: 1 - self.progress, duration: 0.1 })
                    }
                })
            }
        })
        
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [])

    return (
        <div className=''>
            <div className='relative h-[500vh]'>
                <div className='sticky top-0 left-0 h-[20vh] flex justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-4'>
                    <h1 className='main-title text-[6vw] md:text-[3vw] font-medium overflow-hidden text-center'>Why To Use Samparka?</h1>
                </div>

                <div className='why-card sticky top-[20vh] left-0 h-[80vh] w-full bg-[#1E87E3] rounded-t-[30px] md:rounded-t-[60px]'>

                    {/* number */}
                    <div className='absolute right-4 md:right-10 top-2 md:top-0 justify-end'>
                        <h1 className='inline-block bg-white rounded-lg md:rounded-xl text-[#1E87E3] font-medium text-xl md:text-2xl px-4 md:px-6 py-1 m-4 md:m-10 mb-0'>01</h1>
                    </div>

                    <div className='card-content h-full w-full flex flex-col md:flex-row items-center justify-center md:justify-around p-6 md:p-12 gap-6 md:gap-0'>

                        {/* left Side - Visual Element */}
                        <div className='flex justify-center items-center order-2 md:order-1'>
                            <img className='w-60 md:w-80 lg:w-120 max-w-full h-auto' src="/images/whySamparka/cloud.png" alt="" />
                        </div>


                        {/* Right Side - Title */}
                        <div className='flex items-center justify-center max-w-md order-1 md:order-2'>

                            <h2 className='text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight text-center md:text-left'>
                                Upgrade from old punch cards to a modern cloud-based rewards solution.
                            </h2>
                        </div>


                    </div>
                </div>
                <div className='why-card sticky top-[20vh] left-0 h-[80vh] w-full bg-[#7E66C9] rounded-t-[30px] md:rounded-t-[60px]'>

                    {/* number */}
                    <div className='absolute right-4 md:right-10 top-2 md:top-0 justify-end'>
                        <h1 className='inline-block bg-white rounded-lg md:rounded-xl text-[#7E66C9] font-medium text-xl md:text-2xl px-4 md:px-6 py-1 m-4 md:m-10 mb-0'>02</h1>
                    </div>

                    <div className='card-content h-full w-full flex flex-col md:flex-row items-center justify-center md:justify-around p-6 md:p-12 gap-6 md:gap-0'>

                        {/* left Side - Visual Element */}
                        <div className='flex justify-center items-center order-2 md:order-1'>
                            <img className='w-60 md:w-80 lg:w-120 max-w-full h-auto' src="/images/whySamparka/tool.png" alt="" />
                        </div>


                        {/* Right Side - Title */}
                        <div className='flex items-center justify-center max-w-md order-1 md:order-2'>

                            <h2 className='text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight text-center md:text-left'>
                                Securely manage rewards with manual point control.
                            </h2>
                        </div>


                    </div>
                </div>
                <div className='why-card sticky top-[20vh] left-0 h-[80vh] w-full bg-[#E87375] rounded-t-[30px] md:rounded-t-[60px]'>

                    {/* number */}
                    <div className='absolute right-4 md:right-10 top-2 md:top-0 justify-end'>
                        <h1 className='inline-block bg-white rounded-lg md:rounded-xl text-[#E87375] font-medium text-xl md:text-2xl px-4 md:px-6 py-1 m-4 md:m-10 mb-0'>03</h1>
                    </div>

                    <div className='card-content h-full w-full flex flex-col md:flex-row items-center justify-center md:justify-around p-6 md:p-12 gap-6 md:gap-0'>

                        {/* left Side - Visual Element */}
                        <div className='flex justify-center items-center order-2 md:order-1'>
                            <img className='w-60 md:w-80 lg:w-120 max-w-full h-auto' src="/images/whySamparka/shield.png" alt="" />
                        </div>


                        {/* Right Side - Title */}
                        <div className='flex items-center justify-center max-w-md order-1 md:order-2'>

                            <h2 className='text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight'>
                                Prevent abuse with our “safe-mode” for verifying points and rewards.
                            </h2>
                        </div>


                    </div>
                </div>
                <div className='why-card sticky top-[20vh] left-0 h-[80vh] w-full bg-[#7BC363] rounded-t-[30px] md:rounded-t-[60px]'>

                    {/* number */}
                    <div className='absolute right-4 md:right-10 top-2 md:top-0 justify-end'>
                        <h1 className='inline-block bg-white rounded-lg md:rounded-xl text-[#7BC363] font-medium text-xl md:text-2xl px-4 md:px-6 py-1 m-4 md:m-10 mb-0'>04</h1>
                    </div>

                    <div className='card-content h-full w-full flex flex-col md:flex-row items-center justify-center md:justify-around p-6 md:p-12 gap-6 md:gap-0'>

                        {/* left Side - Visual Element */}
                        <div className='flex justify-center items-center order-2 md:order-1'>
                            <img className='w-60 md:w-80 lg:w-120 max-w-full h-auto' src="/images/whySamparka/analytics.png" alt="" />
                        </div>


                        {/* Right Side - Title */}
                        <div className='flex items-center justify-center max-w-md order-1 md:order-2'>

                            <h2 className='text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight text-center md:text-left'>
                                Get real-time analytics.
                            </h2>
                        </div>


                    </div>
                </div>
                <div className='why-card sticky top-[20vh] left-0 h-[80vh] w-full bg-[#D64FEE] rounded-t-[30px] md:rounded-t-[60px]'>

                    {/* number */}
                    <div className='absolute right-4 md:right-10 top-2 md:top-0 justify-end'>
                        <h1 className='inline-block bg-white rounded-lg md:rounded-xl text-[#D64FEE] font-medium text-xl md:text-2xl px-4 md:px-6 py-1 m-4 md:m-10 mb-0'>05</h1>
                    </div>

                    <div className='card-content h-full w-full flex flex-col md:flex-row items-center justify-center md:justify-around p-6 md:p-12 gap-6 md:gap-0'>

                        {/* left Side - Visual Element */}
                        <div className='flex justify-center items-center order-2 md:order-1'>
                            <img className='w-60 md:w-80 lg:w-120 max-w-full h-auto' src="/images/whySamparka/qr.png" alt="" />
                        </div>


                        {/* Right Side - Title */}
                        <div className='flex items-center justify-center max-w-md order-1 md:order-2'>

                            <h2 className='text-white text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal leading-tight text-center md:text-left'>
                                Use smart QR/NFC for instant membership creation and point tracking.
                            </h2>
                        </div>


                    </div>
                </div>
            </div>
        </div>

    )
}

export default WhyToUse