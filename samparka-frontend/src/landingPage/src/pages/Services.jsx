import React from 'react';
import { Helmet } from "react-helmet-async";
import Services from '../components/Services';
import Footer from '../components/Footer';

const ServicesPage = () => {
  return (
    <>
      <Helmet>
        <title>Our Services | Samparka - Digital Loyalty Platform</title>
        <meta
          name="description"
          content="Explore Samparka's comprehensive loyalty services including dashboard management, analytics, gamification, reservations, and more."
        />
        <link rel="canonical" href="https://samparka.co/services" />

        <meta property="og:title" content="Our Services | Samparka" />
        <meta
          property="og:description"
          content="Discover our full range of loyalty and customer engagement services designed to grow your business."
        />
        <meta property="og:url" content="https://samparka.co/services" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="relative bg-[#F6F4F7] pt-24">
        <Services />
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

export default ServicesPage;
