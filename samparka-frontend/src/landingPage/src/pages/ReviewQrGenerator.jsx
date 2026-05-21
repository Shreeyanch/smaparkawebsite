import React from 'react';
import { Helmet } from "react-helmet-async";
import ReviewQrGenerator from '../components/ReviewQrGenerator';
import Footer from '../components/Footer';
import SecondHero from '../components/SecondHero';

const ReviewGeneratorPage = () => {
  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Google Review Generator | Free Google Review Qr Code Generator – Samparka</title>
        <meta
          name="description"
          content="Generate a Google review link and create a printable QR code flyer to help customers leave reviews easily. Free customer review tool by Samparka."
        />
        <link
          rel="canonical"
          href="https://samparka.co/reviewqrgenerator"
        />
      </Helmet>
      {/* ======================================= */}

      <div className="min-h-screen bg-white pt-20">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-10 md:pt-25 pb-5 md:pb-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3">
            Google Review Generato<span className="relative inline-block">r</span>
            <img 
              src="/landingPage/images/bluetick.png" 
              alt="verified" 
              className="inline-block w-7 h-7 md:w-12 md:h-12 ml-[-1px] -mt-6 md:-mt-8"
            />
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Create a simple, shareable QR code flyer to collect customer reviews effortlessly.
          </p>
        </div>

        <ReviewQrGenerator />
        <SecondHero />
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

export default ReviewGeneratorPage;
