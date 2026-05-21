import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Search, Star, Download, Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';

const ReviewQrGenerator = () => {
  const [place, setPlace] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [logo, setLogo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [fontColor, setFontColor] = useState('#111827');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgImage, setBgImage] = useState(null);
  const [bgType, setBgType] = useState('color');
  const inputRef = useRef(null);
  const printRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const debounceRef = useRef(null);
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (window.google?.maps?.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    document.head.appendChild(script);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (!autocompleteServiceRef.current) return;
      autocompleteServiceRef.current.getPlacePredictions(
        { input: value, types: ['establishment'] },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    }, 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);

    if (!placesServiceRef.current) return;
    placesServiceRef.current.getDetails(
      { placeId: suggestion.place_id, fields: ['place_id', 'name', 'formatted_address'] },
      (placeResult, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && placeResult) {
          setPlace(placeResult);
          setInputValue(placeResult.name);
        }
      }
    );
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result);
        setBgType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadPDF = async () => {
    if (!printRef.current) return;

    try {
      const dataUrl = await toPng(printRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        skipFonts: false,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${place?.name || 'google'}-review-flyer.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const reviewUrl = place ? `https://search.google.com/local/writereview?placeid=${place.place_id}&rating=5` : '';

  const getBackgroundStyle = () => {
    if (bgType === 'image' && bgImage) {
      return {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: bgColor };
  };

  return (
    <div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8'>
      {/* GIF Animation */}
      <div className='max-w-3xl mx-auto mb-6'>
        <img 
          src="/landingPage/images/peopleincycle.gif" 
          alt="People cycle animation" 
          className='w-full h-auto'
        />
      </div>

      {/* Search Bar */}
      <div className='max-w-3xl mx-auto mb-12'>
        <div className='relative'>
          <Search className='absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10' />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search your business name..."
            className='w-full pl-14 pr-6 py-4 text-lg bg-white border-2 border-gray-200 rounded-full focus:border-gray-900 focus:outline-none transition-colors shadow-sm'
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden'>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  className='w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0'
                  onMouseDown={() => handleSelectSuggestion(suggestion)}
                >
                  <p className='text-sm font-medium text-gray-900'>
                    {suggestion.structured_formatting.main_text}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {place && (
        <div className='grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto'>
          {/* Left Side - Controls */}
          <div className='space-y-6'>
            {/* Review URL Display with Copy Button */}
            <div className='bg-gray-50 border border-gray-200 rounded-xl p-6'>
              <label className='block text-sm font-semibold text-gray-900 mb-3'>
                Review URL Generated
              </label>
              <div className='bg-white border border-gray-200 rounded-lg p-3 break-all text-sm text-gray-600 mb-3'>
                {reviewUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className='flex items-center justify-center gap-2 w-full py-2.5 bg-white border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors'
              >
                {copied ? (
                  <>
                    <Check className='w-4 h-4' />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className='w-4 h-4' />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Logo Upload */}
            <div className='bg-gray-50 border border-gray-200 rounded-xl p-6'>
              <label className='block text-sm font-semibold text-gray-900 mb-3'>
                Add Your Logo (Optional)
              </label>
              <div className='relative'>
                <input 
                  type="file" 
                  id="logo-upload"
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className='hidden'
                />
                <label 
                  htmlFor="logo-upload"
                  className='flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors cursor-pointer'
                >
                  <Upload className='w-4 h-4' />
                  Choose File
                </label>
              </div>
              {logo && (
                <div className='mt-4 p-4 bg-white border border-gray-200 rounded-lg'>
                  <img src={logo} alt="Logo preview" className='h-16 object-contain mx-auto' />
                </div>
              )}
            </div>

            {/* Font Color Picker */}
            <div className='bg-gray-50 border border-gray-200 rounded-xl p-6'>
              <label className='block text-sm font-semibold text-gray-900 mb-3'>
                Text Color
              </label>
              <div className='flex items-center gap-3'>
                <input 
                  type="color" 
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className='w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300'
                />
                <input 
                  type="text" 
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className='flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none'
                  placeholder="#111827"
                />
              </div>
            </div>

            {/* Background Customization */}
            <div className='bg-gray-50 border border-gray-200 rounded-xl p-6'>
              <label className='block text-sm font-semibold text-gray-900 mb-3'>
                Background
              </label>
              
              {/* Background Type Toggle */}
              <div className='flex gap-2 mb-4'>
                <button
                  onClick={() => setBgType('color')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    bgType === 'color' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white border-2 border-gray-300 text-gray-700'
                  }`}
                >
                  Color
                </button>
                <button
                  onClick={() => setBgType('image')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    bgType === 'image' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white border-2 border-gray-300 text-gray-700'
                  }`}
                >
                  Image
                </button>
              </div>

              {bgType === 'color' ? (
                <div className='flex items-center gap-3'>
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className='w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300'
                  />
                  <input 
                    type="text" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className='flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none'
                    placeholder="#ffffff"
                  />
                </div>
              ) : (
                <div>
                  <input 
                    type="file" 
                    id="bg-upload"
                    accept="image/*" 
                    onChange={handleBgImageUpload}
                    className='hidden'
                  />
                  <label 
                    htmlFor="bg-upload"
                    className='flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-colors cursor-pointer'
                  >
                    <ImageIcon className='w-4 h-4' />
                    Choose Background Image
                  </label>
                  {bgImage && (
                    <div className='mt-3 p-2 bg-white border border-gray-200 rounded-lg'>
                      <img src={bgImage} alt="Background preview" className='h-20 w-full object-cover rounded' />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Download className='w-5 h-5' />
              Download PDF Flyer
            </button>
          </div>

          {/* Right Side - Preview */}
          <div className='flex flex-col items-center sticky top-8'>
            <div className='mb-4'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Live Preview</span>
            </div>
            
            <div 
              ref={printRef}
              style={{ 
                width: '400px',
                aspectRatio: '1/1.414',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                ...getBackgroundStyle(),
                color: fontColor,
                borderRadius: '16px',
                border: '2px solid #d1d5db',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Top Section */}
              <div style={{ width: '100%', textAlign: 'center' }}>
                {logo ? (
                  <div style={{ marginBottom: '20px' }}>
                    <img src={logo} alt="Logo" style={{ height: '56px', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ height: '56px', marginBottom: '20px' }} />
                )}
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  lineHeight: '1.25', 
                  padding: '0 8px',
                  color: fontColor 
                }}>
                  Share Your Experience
                </h2>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  padding: '0 8px',
                  color: fontColor, 
                  opacity: 0.8 
                }}>
                  Scan to leave us a Google review
                </p>
              </div>

              {/* QR Code */}
              <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '20px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '2px solid #e5e7eb'
              }}>
                <QRCodeCanvas id="qr-canvas" value={reviewUrl} size={200} level="H" />
              </div>

              {/* Bottom Section */}
              <div style={{ width: '100%', textAlign: 'center', padding: '0 8px' }}>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: fontColor 
                }}>
                  {place?.name}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: '20px', height: '20px' }} fill="#facc15" color="#facc15" />
                  ))}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  paddingTop: '12px', 
                  borderTop: `1px solid ${fontColor}`,
                  opacity: 0.3 
                }}>
                  <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: fontColor 
                  }}>
                    Review us on Google
                  </span>
                </div>
              </div>
            </div>

            {/* Copy and Download Buttons Below Preview */}
            <div className='w-full max-w-[400px] mt-6 space-y-3'>
              <button
                onClick={copyToClipboard}
                className='flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-colors shadow-sm'
              >
                {copied ? (
                  <>
                    <Check className='w-4 h-4' />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className='w-4 h-4' />
                    Copy Review Link
                  </>
                )}
              </button>
              
              <button
                onClick={downloadPDF}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Download className='w-4 h-4' />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewQrGenerator;