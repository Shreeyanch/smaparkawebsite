import QRCode from "react-qr-code";
import { QrCode, Star, Gift } from "lucide-react";
import FlyerCardPreview from "./FlyerCardPreview";


const GoldCorner = ({ className }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0C0 0 25 4 45 22C65 40 68 68 68 68C68 68 40 64 22 45C4 26 0 0 0 0Z" fill="#c9a84c" opacity="0.35" />
    <path d="M0 0C0 0 12 18 30 32C48 46 68 50 68 50C68 50 48 32 30 18C12 4 0 0 0 0Z" fill="#d4af37" opacity="0.2" />
    <path d="M0 25C8 25 22 30 32 40C42 50 42 68 42 68C32 68 18 58 13 48C8 38 0 25 0 25Z" fill="#c9a84c" opacity="0.18" />
    <path d="M25 0C25 0 30 12 40 25C50 38 68 42 68 42C68 35 58 22 48 13C38 4 25 0 25 0Z" fill="#c9a84c" opacity="0.18" />
    <circle cx="8" cy="8" r="2" fill="#d4af37" opacity="0.5" />
    <circle cx="20" cy="3" r="1.5" fill="#c9a84c" opacity="0.3" />
    <circle cx="3" cy="20" r="1.5" fill="#c9a84c" opacity="0.3" />
  </svg>
);

const PHONE_W = 200;
const INNER_W = PHONE_W - 10;
const SCALE = INNER_W / 300;

const StoreQRFlyer = ({ store, qrUrl, flyerRef, customBg, flyerImages = {} }) => (
  <div className="flex justify-center">
    <div ref={flyerRef} className="relative overflow-hidden  flex flex-col" style={{ fontFamily: "'Poppins', sans-serif", width: 340, height: 529 }}>
      {/* Dark Section with Phone */}
      <div className="relative bg-orange-100 pt-10 pb-6 overflow-hidden flex-shrink-0 h-full">
          {/* background */}
        <div className="absolute top-0 left-0 object-cover h-full w-full bg-black/90 z-0">
          
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#c9a84c 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

        {(flyerImages.qrStandBg || customBg) ? (
          <img src={flyerImages.qrStandBg || customBg} alt="" className="absolute inset-0 w-full h-full object-cover z-[1]" />
        ) : (
          <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none select-none">
            <div style={{ transform: "rotate(-30deg) translate(-30%, -40%)", whiteSpace: "nowrap", lineHeight: "1", width: "200%", position: "absolute", top: 0, left: 0 }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="text-white/30 text-lg font-bold uppercase tracking-widest" style={{ marginLeft: i % 2 === 0 ? "0px" : "80px", marginBottom: "48px" }}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <span key={j} style={{ marginRight: "48px" }}>Background</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phone Mockup */}
        <div className="relative mx-auto z-10" style={{ width: PHONE_W }}>
          <div className="bg-[#1a1a1a] rounded-[1.8rem] p-[5px]" style={{ boxShadow: "0 16px 50px rgba(0,0,0,0.5)" }}>
            {/* Notch */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-16 h-[14px] bg-[#1a1a1a] rounded-lg z-10" />
            {/* Screen */}
            <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ height: 330 }}>
              {/* Status bar */}
              <div className="flex justify-between items-center px-4 pt-1.5 text-[7px] text-gray-500 font-medium">
                <span>1:00</span>
                <div className="w-[9px] h-[5px] border border-gray-400 rounded-[1px] relative">
                  <div className="absolute inset-[1px] right-[2px] bg-gray-500 rounded-[0.5px]" />
                </div>
              </div>
              {/* Scaled app content */}
              <div className="overflow-hidden" style={{ height: 315 }}>
                <div style={{ width: 300, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
                  <FlyerCardPreview store={store} flyerImages={flyerImages} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White Section */}
      <div className="bg-[#fafafa] absolute bottom-0 z-20 px-5 pt-5 pb-4 w-full rounded-t-[0.8rem] shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex gap-5">
          {/* QR Code - left */}
          <div className="flex-shrink-0">
            <QRCode value={qrUrl} size={140} level="H" />
          </div>

          {/* Right content */}
          <div className="flex-1">
            {/* Icons row */}
            <div className="flex justify-between mb-4">
              {[
                { icon: QrCode, label: "SCAN THE\nQR CODE" },
                { icon: Star, label: "EARN\nPOINTS" },
                { icon: Gift, label: "REDEEM\nREWARD" },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex flex-col items-center gap-[5px]">
                  <div className="w-[38px] h-[38px] rounded-full bg-white flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px] text-gray-900" strokeWidth={1.5} />
                  </div>
                  <p className="text-[6px] font-bold text-gray-900 leading-[1.3] whitespace-pre-line tracking-[0.05em] text-center uppercase">{label}</p>
                </div>
              ))}
            </div>
            {/* Join text */}
            <div className="text-right" style={{ fontFamily: "'Garet', 'Poppins', serif" }}>
              <p className="text-[30px] leading-[1] font-bold text-gray-900 tracking-tight">Join Our</p>
              <p className="text-[18px] leading-[1.1] font-normal text-gray-900 tracking-tight">Loyalty Club!</p>
            </div>
          </div>
        </div>

        {/* powered by samparka static */}
        <div className="mt-5 flex flex-col items-center leading-0.5 tracking-widest">
          <p className="text-[6px] text-center uppercase">Powered By</p>
          <img
            src="/SAMPARKA.png"
            alt="Samparka Logo"
            className="w-16 object-contain"
          />
        </div>

        {/* powered by samparka dynamic */}

        {/* {store?.services?.powered !== false && (
        <div className="mt-5 flex flex-col items-center leading-0.5 tracking-widest">
          <p className="text-[6px] text-center uppercase">Powered By</p>
          <img
            src="/SAMPARKA.png"
            alt="Samparka Logo"
            className="w-16 object-contain"
          />
        </div>
      )} */}
      </div>

    </div>
  </div>
);

export default StoreQRFlyer;
