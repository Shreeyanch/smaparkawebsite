import React from 'react';
import { Helmet } from "react-helmet-async";
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const PricingPage = () => {
  return (
    <>
      <Helmet>
        <title>Pricing | Samparka - Affordable Loyalty Solutions</title>
        <meta
          name="description"
          content="Choose the perfect Samparka pricing plan for your business. Flexible options from Monthly to MegaBiz with no hidden fees."
        />
        <link rel="canonical" href="https://samparka.co/pricing" />

        <meta property="og:title" content="Pricing | Samparka" />
        <meta
          property="og:description"
          content="Start building customer loyalty today with our flexible pricing plans. No hidden fees, no long-term contracts."
        />
        <meta property="og:url" content="https://samparka.co/pricing" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="relative bg-[#F6F4F7] pt-24">
        <Pricing />
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

export default PricingPage;
