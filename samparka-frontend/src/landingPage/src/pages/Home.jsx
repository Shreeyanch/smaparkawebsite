import React from 'react';
import { Helmet } from "react-helmet-async";

import Hero from '../components/Hero';
import Partners from '../components/Partners';
import Services from '../components/Services';
import WhySamparka from '../components/WhySamparka';
import WhyToUse from '../components/WhyToUse';
import Security from '../components/Security';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import Pod from '../assets/Pod';
import Award from '../components/Award';
import NewSecurity from '../components/NewSecurity';
import SecondHero from '../components/SecondHero';
import FAQs from '../components/FAQs';
import NewServices from './NewServices';

const Home = () => {
  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Branded Loyalty App or WhatsApp Loyalty | Samparka</title>
        <meta
          name="description"
          content="Turn first-time customers into regulars with your own loyalty app or WhatsApp rewards. Easy setup live in minutes."
        />
        <link rel="canonical" href="https://samparka.co/" />

        {/* Open Graph */}
        <meta property="og:title" content="Branded Loyalty App or WhatsApp Loyalty | Samparka" />
        <meta
          property="og:description"
          content="Turn first-time customers into regulars with your own loyalty app or WhatsApp rewards. Easy setup live in minutes."
        />
        <meta property="og:image" content="https://samparka.co/landingPage/images/hero/desktop.png" />
        <meta property="og:url" content="https://samparka.co/" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Branded Loyalty App or WhatsApp Loyalty | Samparka" />
        <meta name="twitter:description" content="Turn first-time customers into regulars with your own loyalty app or WhatsApp rewards. Easy setup live in minutes." />
        <meta name="twitter:image" content="https://samparka.co/landingPage/images/hero/desktop.png" />
      </Helmet>
      {/* ======================================= */}

      <div className="relative bg-[#F6F4F7]">
        <div id="home">
          <Hero />
          <SecondHero />
        </div>
        
        <div id="services">
          <NewServices />
        </div>

        <div id="partners">
          <Partners />
        </div>


        <div id="why-samparka">
          <NewSecurity />
        </div>

        <div id="pricing">
          <Pricing />
        </div>

        <div id="faqs">
          <FAQs />
        </div>

        <Testimonials />
        <Footer />

        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/9779843742684"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out"
          aria-label="Chat on WhatsApp"
        >
          <img 
            src="/landingPage/images/whatsapp.png"
            alt="WhatsApp"
            className="w-full h-full object-contain"
          />
        </a>
      </div>
    </>
  );
};

export default Home;
