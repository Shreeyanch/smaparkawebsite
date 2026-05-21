import { useEffect, useState } from 'react'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlareHover from '../effects/GlareHover';
import Pod from '../assets/Pod';
import FloatingCards from './FloatingCards';
import { useNavigate } from "react-router-dom";


gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    // You can send the data to your backend API

    // Reset form and close modal
    setFormData({ name: '', phone: '', description: '' });
    setShowDemoForm(false);

    // You might want to show a success message here
    alert('Thank you! We will contact you soon.');
  };

  useEffect(() => {
    const sideDiv = document.querySelector('.sidecontent-container');

    // Animate side contents from center
    const leftContents = document.querySelectorAll('.left-content .inline-flex');
    const rightContents = document.querySelectorAll('.right-content .inline-flex');

    // Set initial state - completely invisible
    gsap.set([...leftContents, ...rightContents], {
      scale: 0,
      opacity: 0,
      transformOrigin: 'center center'
    });

    // Left content comes from right
    gsap.fromTo(leftContents, {
      x: 200,
      scale: 0,
      opacity: 0,
    }, {
      x: 0,
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: 'back.out(1.7)',
      stagger: 0.1,
      scrollTrigger: {
        trigger: sideDiv,
        start: window.innerWidth < 640 ? 'top 60px' : 'top 0',
        toggleActions: 'play none none reverse',
        markers:false
      }
    });

    // Right content comes from left
    gsap.fromTo(rightContents, {
      x: -200,
      scale: 0,
      opacity: 0,
    }, {
      x: 0,
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: 'back.out(1.7)',
      stagger: 0.08,
      scrollTrigger: {
        trigger: sideDiv,
        start: window.innerWidth < 640 ? 'top 60px' : 'top 0',
        toggleActions: 'play none none reverse',
      }
    });
  }, []);

  return (
    <div className='hero-content relative w-full flex flex-col items-center justify-end bg-[#F6F4F7] pt-20 sm:pt-20 lg:pt-0'>
      {/* Left gradient */}
      {/* <div
        className='fixed top-0 left-0 w-full h-full pointer-events-none z-0'
        style={{
          background: 'radial-gradient(ellipse 600px 800px at 1% 60%, #8DCEB0 0%, transparent 70%)'
        }}
      ></div> */}

      {/* Right gradient */}
      {/* <div
        className='fixed top-0 left-0 w-full h-full pointer-events-none z-0'
        style={{
          background: 'radial-gradient(ellipse 600px 800px at 90% 30%, #C7ECEB 0%, transparent 70%)'
        }}
      ></div> */}



      <div className='z-40 px-4 sm:px-6 md:px-4 relative'>
        <div className='absolute top-4 sm:top-8 lg:top-45 -left-4 sm:-left-10 md:-left-46 hidden md:hidden lg:block'>
          <div className='relative w-24 sm:w-32 md:w-46'>
            <img src="/landingPage/images/hero/message.png" alt="" className='w-full' />

            <p className='absolute flex w-full justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs sm:text-sm md:text-md font-medium text-white'>Hello Customer 👋</p>
          </div>
        </div>


        <div className='mt-8 sm:mt-12 lg:mt-40 w-full flex flex-col justify-start items-center'>
          <div className='flex items-center gap-2'>
            <img src="/landingPage/images/hero/leaf.png" alt="" className='w-3 sm:w-4' />

            <p className='font-medium text-sm sm:text-base'>
              Trusted by 25k+ customers
            </p>

            <img src="/landingPage/images/hero/leaf.png" alt="" className='w-3 sm:w-4 scale-x-[-1]' />

          </div>
          <div>


            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-[4vw] text-center text-gray-800 font-medium leading-tight md:leading-[4vw] px-2'>
              One stop
              <img src="/landingPage/images/hero/desktop.png" alt="digital" className='inline-block h-[0.8em] sm:h-[1em] w-auto align-center ml-2 sm:ml-4 mr-1 sm:mr-2 drop-shadow-lg rotate-8' />
              {/* <img src="/landingPage/images/hero/digital-cutout.png" alt="digital" className='inline-block h-[1em] w-auto align-baseline' /> */}
              digital
              <br />
              <img src="/landingPage/images/hero/herophone.png" alt="digital" className='inline-block h-[1.2em] sm:h-[1.5em] w-auto align-center drop-shadow-lg' />
              loyalty solution.
              {/* for your <br />
              <span className='relative inline-block text-green-700'>
                business
                <img src="/landingPage/images/hero/scribble2.png" className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !w-[5em] h-[2.2em] -z-10 max-w-none' alt="" />
              </span>. */}

            </h1>
            <p className='mt-4 text-sm sm:text-base md:text-lg text-gray-800 max-w-xs sm:max-w-sm md:max-w-md mx-auto text-center px-4'>A smart digital loyalty platform that turns every visit into repeat business.</p>
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-center sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 items-center w-full max-w-md px-4">
            {/* <button
              className="w-full sm:w-auto bg-white/10 backdrop-blur-3xl border border-white/30 hover:bg-white/20 text-black font-regular px-6 sm:px-8 py-3 rounded-full hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              style={{
                boxShadow: 'inset -3px -3px 12px rgba(255, 255, 255, 0.4), inset 3px 3px 12px rgba(0, 0, 0, 0.15), 6px 6px 24px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
              onClick={() => {
                setShowVideo(true);
              }}
            >
              Watch a Video
            </button> */}
            <button
              className="w-full sm:w-48 px-6 sm:px-8 py-3 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-2.5 overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer"
              style={{
                backgroundColor: '#275B44',
                boxShadow: `
                  inset 0px -3px 3px 1px rgba(255,245,221,0.10),
                  inset 2.5px -2px 3px 0px rgba(124,108,94,0.75),
                  inset 0px -3px 1px 0px rgba(0,0,0,0.50),
                  inset 1px 1px 3px 3px rgba(39,91,68,1.00),
                  inset 0px 4.75px 0.25px -2.5px rgba(251,251,251,0.50),
                  inset 1.25px 1.5px 0px 0px rgba(0,0,0,0.75),
                  inset 3px 5px 2px -4.75px rgba(255,255,255,0.30),
                  inset 0px 0px 0.25px 1.25px rgba(39,91,68,1.00)
                `
              }}
              onClick={() => navigate("/login")}
            >
              <span className="text-zinc-100 text-sm sm:text-base font-normal font-['Helvetica'] [text-shadow:_0px_0px_2px_rgb(241_237_238_/_0.40)]">Free Trial</span>
            </button>

          </div>

        </div>

      </div>

      <div className='hero-image-section relative h-[180vh] sm:h-[180vh] md:h-[180vh] lg:h-[180vh] w-full z-40'>

        {/* pod */}
        <div className='sticky -top-10 sm:-top-20 mt-10 md:mt-0 lg:mt-0 flex justify-center items-center px-2 sm:px-0 md:px-4'>
          <div className='w-full sm:w-full md:w-[55vw] lg:w-[60vw] z-40'>
            <Pod />
            <FloatingCards />
          </div>
        </div>


        {/* <div className='h-[40vh] '></div> */}

        <div className='h-screen sticky top-0 flex justify-center items-center px-2 sm:px-4'>

          {/* Phone  */}
          <div className='phone-container relative w-[60vw] sm:w-[50vw] md:w-[35vw] lg:w-[18vw] z-40 '>
            <img className='w-full' src="/landingPage/images/iphone.png" alt="Mobile phone mockup" />
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2/5 w-[60%]'>
              <GlareHover image="https://res.cloudinary.com/dtxqsnd7b/image/upload/v1760433249/Card4_l1uf4i.webp" />
            </div>
          </div>

          {/* side contents */}
          <div className='z-50 sidecontent-container absolute top-0 h-screen w-full flex justify-between gap-2 sm:gap-4 md:gap-16 items-center px-1 sm:px-2 md:px-0'>
            {/* left content */}
            <div className='left-content mt-5 flex flex-col gap-6 sm:gap-8 md:gap-20 items-start w-full'>
              <div className='inline-flex gap-1 sm:gap-2 md:gap-4 items-center px-2 sm:px-3 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-xl w-fit self-center md:self-start lg:self-center opacity-0 scale-0 bg-white/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none border border-white/30 sm:border-none shadow-lg sm:shadow-none'>
                <h1 className='text-gray-700 text-xs sm:text-sm md:text-[2vw] lg:text-[1.2vw] whitespace-nowrap leading-tight px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium drop-shadow-sm'>Boost <br />Sales</h1>
                <img src="/landingPage/images/HeroSide/Boost.png" alt="" className='w-8 sm:w-10 md:w-14' />
              </div>
              <div className='inline-flex gap-1 sm:gap-2 md:gap-4 items-center px-2 sm:px-3 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-xl w-fit self-start ml-4 sm:ml-6 md:ml-0 lg:ml-20 opacity-0 scale-0 bg-white/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none border border-white/30 sm:border-none shadow-lg sm:shadow-none'>
                <h1 className='text-gray-700 text-xs sm:text-sm md:text-[2vw] lg:text-[1.2vw] whitespace-nowrap leading-tight px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium drop-shadow-sm'>Launch <br />Fast</h1>
                <img src="/landingPage/images/HeroSide/Launch.png" alt="" className='w-8 sm:w-10 md:w-14' />
              </div>
              <div className='inline-flex gap-1 sm:gap-2 md:gap-4 items-center px-2 sm:px-3 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-xl w-fit self-center md:self-start lg:self-center opacity-0 scale-0 bg-white/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none border border-white/30 sm:border-none shadow-lg sm:shadow-none'>
                <h1 className='text-gray-700 text-xs sm:text-sm md:text-[2vw] lg:text-[1.2vw] whitespace-nowrap leading-tight px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium drop-shadow-sm'>Simple <br />Interface</h1>
                <img src="/landingPage/images/HeroSide/Interface.png" alt="" className='w-8 sm:w-10 md:w-14' />
              </div>
            </div>
            {/* right content */}
            <div className='right-content mt-5 flex flex-col gap-6 sm:gap-8 md:gap-20 items-end w-full'>
              <div className='inline-flex gap-1 sm:gap-2 md:gap-4 items-center px-2 sm:px-3 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-xl w-fit self-center md:self-end lg:self-center opacity-0 scale-0 bg-white/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none border border-white/30 sm:border-none shadow-lg sm:shadow-none'>
                <img src="/landingPage/images/HeroSide/POS.png" alt="" className='w-8 sm:w-10 md:w-14' />
                <h1 className='text-gray-700 text-xs sm:text-sm md:text-[2vw] lg:text-[1.2vw] whitespace-nowrap leading-tight px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium drop-shadow-sm'>POS-Ready</h1>
              </div>
              <div className='inline-flex gap-1 sm:gap-2 md:gap-4 items-center px-2 sm:px-3 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-xl w-fit self-end mr-4 sm:mr-6 md:mr-0 lg:mr-20 opacity-0 scale-0 bg-white/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none border border-white/30 sm:border-none shadow-lg sm:shadow-none'>
                <img src="/landingPage/images/HeroSide/Custom.png" alt="" className='w-8 sm:w-10 md:w-14' />
                <h1 className='text-gray-700 text-xs sm:text-sm md:text-[2vw] lg:text-[1.2vw] whitespace-nowrap leading-tight px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium drop-shadow-sm'>Custom <br />for You</h1>
              </div>
              <div className='inline-flex gap-1 sm:gap-2 md:gap-4 items-center px-2 sm:px-3 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-xl w-fit self-center md:self-end lg:self-center opacity-0 scale-0 bg-white/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none border border-white/30 sm:border-none shadow-lg sm:shadow-none'>
                <img src="/landingPage/images/HeroSide/SecureCloud.png" alt="" className='w-8 sm:w-10 md:w-14' />
                <h1 className='text-gray-700 text-xs sm:text-sm md:text-[2vw] lg:text-[1.2vw] whitespace-nowrap leading-tight px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium drop-shadow-sm'>Secure <br />Cloud</h1>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* <div className='absolute top-0 h-[200vh] w-full'>
        <FloatingCards />
      </div> */}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 text-gray-600 hover:text-gray-800 text-lg sm:text-xl font-light z-10 bg-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            >
              ×
            </button>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/9-LAMxLL9P8?si=otWSwuOhoHGNmOP6"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Demo Form Modal */}
      {showDemoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#F6F4F7] rounded-2xl p-4 sm:p-6 md:p-8 max-w-3xl w-full mx-4 shadow-2xl border border-white/20 max-h-[90vh] ">
            <button
              onClick={() => setShowDemoForm(false)}
              className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 text-gray-600 hover:text-gray-800 text-lg sm:text-xl font-light z-10 bg-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            >
              ×
            </button>

            <div className="mb-6 sm:mb-8 md:mb-10 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800 mb-2 sm:mb-3">Book a Demo</h2>
              <p className="text-gray-600 text-sm sm:text-base">Fill out the form below and we'll get in touch with you soon.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    style={{
                      boxShadow: 'inset 2px 2px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 8px rgba(255, 255, 255, 0.8)'
                    }}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    style={{
                      boxShadow: 'inset 2px 2px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 8px rgba(255, 255, 255, 0.8)'
                    }}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-500"
                  style={{
                    boxShadow: 'inset 2px 2px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 8px rgba(255, 255, 255, 0.8)'
                  }}
                  placeholder="Tell us about your business needs (optional)"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDemoForm(false)}
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-3xl border border-white/30 hover:bg-white/20 text-black font-regular px-6 sm:px-8 py-3 rounded-full hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                  style={{
                    boxShadow: 'inset -3px -3px 12px rgba(255, 255, 255, 0.4), inset 3px 3px 12px rgba(0, 0, 0, 0.15), 6px 6px 24px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(20px) saturate(180%)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-800 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-2.5 overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer"
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
                  }}
                >
                  <span className="text-zinc-100 text-sm sm:text-base font-normal font-['Helvetica'] [text-shadow:_0px_0px_2px_rgb(241_237_238_/_0.40)]">Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Hero