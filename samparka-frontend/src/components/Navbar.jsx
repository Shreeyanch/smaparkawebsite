import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMenuOpen(false); // Close mobile menu when hiding navbar
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY]);

  return (
    <div className={`flex justify-center w-full fixed top-0 z-50 transition-all duration-300 ease-in-out ${
      isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
    }`}>
      <nav 
        className="px-6 md:px-8 py-3 md:py-4 mx-4 md:mx-6 mt-4 max-w-6xl w-full"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          WebkitBackdropFilter: 'blur(25px)'
        }}
      >
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/">
          <img src="./images/logo_black.png" className="w-24 md:w-36" alt="Logo" />
          
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-4 justify-center items-center">
          <div>
            <ul className="flex gap-6">
              <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
                Home
                <span 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                ></span>
              </li>
              <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
                Partners
                <span 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                ></span>
              </li>
              <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
               Our Services
                <span 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                ></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex items-center justify-center gap-4">
          <div>
            <ul className="flex gap-6">
              <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
                Why Samparka?
                <span 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                ></span>
              </li>
              <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
                Pricing
                <span 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                ></span>
              </li>
              <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-1.5 text-sm">
                <Link to="/blog">
                
                Blog
                </Link>
                <span 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  }}
                ></span>
              </li>
            </ul>
          </div>
          
         <button className='p-2 w-24 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-800 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-2 sm:gap-3 md:gap-4 overflow-hidden transition-transform duration-200 cursor-pointer group hover:scale-105'
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
          <span className='text-xs sm:text-sm md:text-md font-medium text-white'>Login</span>
         
        </button>
        </div>

   

        {/* Mobile/Tablet Hamburger Menu */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-2xl transition-all duration-300 focus:outline-none hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
              <span className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-800 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div 
          className="py-6 mt-4 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            WebkitBackdropFilter: 'blur(25px)'
          }}
        >
          {/* Navigation Links */}
          <ul className="space-y-2 mb-6 px-4">
            <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm">
              Home
              <span 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}
              ></span>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm">
              Partners
              <span 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}
              ></span>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm">
              Our Services
              <span 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}
              ></span>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm">
              Why Samparka?
              <span 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}
              ></span>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm">
              Pricing
              <span 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}
              ></span>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group px-3 py-2 text-sm">
              <Link to="/blog">Blog</Link>
              <span 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-90 group-hover:scale-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                }}
              ></span>
            </li>
          </ul>

          {/* WhatsApp Contact */}
         

          {/* Login Button */}
          <div className="mx-4 mt-4">
            <button className='w-full pl-6 pr-3 py-2.5 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-800 rounded-[74px] outline-1 outline-neutral-400 inline-flex justify-center items-center gap-3 overflow-hidden transition-transform duration-200 cursor-pointer hover:scale-105'
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
              <span className='text-sm font-medium text-white'>Login</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    </div>
  );
};

export default Navbar;
