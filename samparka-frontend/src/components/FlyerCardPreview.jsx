import { Coffee, Smile, ThumbsUp, Star, Bell } from "lucide-react";

const icons = {
  coffee: Coffee,
  smile: Smile,
  thumbsUp: ThumbsUp,
};

const ProgressCircle = ({ size, progress, track, stroke, width = 8 }) => {
  const offset = 314.159 * (1 - Math.min(progress, 100) / 100);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="rotate-[-90deg]">
      <circle cx="60" cy="60" r="50" fill="none" stroke={track} strokeWidth={width} />
      <circle cx="60" cy="60" r="50" fill="none" stroke={stroke} strokeWidth={width}
        strokeDasharray="314.159" strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
};

const StampCenter = ({ stamp, customStamp, color, size = 64 }) => {
  const Icon = icons[stamp] || Coffee;
  return customStamp
    ? <img className="absolute object-contain" style={{ width: size, height: size }} alt="" src={customStamp} />
    : <Icon className="absolute" style={{ width: size, height: size, color }} />;
};

const L1Card = ({ textColor, stamp, customStamp }) => (
  <div className="w-48 h-[260px] flex flex-col items-center justify-center gap-1 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none" />
    <div className="relative flex items-center justify-center w-[150px] h-[150px]">
      <ProgressCircle size={150} progress={42} track="#FFFCEC" stroke="#E6D62D" width={6} />
      <StampCenter stamp={stamp} customStamp={customStamp} color={textColor} size={48} />
    </div>
    <div className="flex flex-col items-center" style={{ color: textColor }}>
      <span className="text-[8px]">Points</span>
      <div className="flex items-center"><b className="text-xl text-gray-200">42</b><img className="w-5 h-5 mb-0.5" alt="" src="/interface--star.svg" /></div>
    </div>
  </div>
);

const L2Card = ({ textColor, stamp, customStamp, stampColor = "#fff", totalShapes = 9 }) => {
  const Icon = icons[stamp] || Coffee;
  const filled = 4;
  return (
    <div className="w-48 h-[260px] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none" />
      <div className="h-[230px] flex flex-row items-center justify-center flex-wrap content-center py-[20px] px-[8px] gap-x-[18px] gap-y-[40px]">
        {Array.from({ length: totalShapes }).map((_, i) => (
          <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: "1px solid", backgroundColor: i < filled ? stampColor : "transparent", borderColor: i < filled ? textColor : "rgba(255,255,255,0.3)" }}>
            {customStamp ? <img src={customStamp} alt="" className={`w-4 h-4 ${i >= filled ? "opacity-50" : ""}`} />
              : <Icon size={16} color={textColor} className={i >= filled ? "opacity-50" : ""} />}
          </div>
        ))}
      </div>
    </div>
  );
};

const L3Card = ({ textColor, stamp, customStamp, tier = [], format }) => {
  const tierName = tier?.[0]?.name || "Bronze";
  return (
    <div className="w-48 h-[260px] flex flex-col items-center justify-center gap-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none" />
      <div className="relative flex items-center justify-center w-[150px] h-[150px]">
        <ProgressCircle size={150} progress={55} track="#FFFCEC" stroke="#E6D62D" width={6} />
        <StampCenter stamp={stamp} customStamp={customStamp} color={textColor} size={48} />
      </div>
      <div className="flex flex-col items-center" style={{ color: textColor }}>
        <span className="text-xs">Points</span>
        <div className="flex items-center"><b className="text-lg text-gray-200">55</b><img className="w-5 h-5 mb-0.5" alt="" src="/interface--star.svg" /></div>
        <span className="text-xs font-medium mt-1">{format === "L3" ? tierName : tierName}</span>
      </div>
    </div>
  );
};

const L4Card = ({ textColor, stamp, customStamp, tier = [] }) => {
  const ct = tier?.[0] || { name: "Bronze", discountPercentage: 5 };
  return (
    <div className="w-48 h-[270px] flex flex-col items-center px-2 py-2 gap-1.5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/[0.06] pointer-events-none" />
      <div className="w-full rounded-xl px-3 py-2 flex flex-col gap-0.5 z-10"
        style={{ border: `1.5px solid ${textColor}28`, background: `${textColor}0D`, backdropFilter: "blur(10px)" }}>
        <span className="text-xs font-bold" style={{ color: textColor }}>{ct.name} Member</span>
        <span className="text-[10px]" style={{ color: textColor, opacity: 0.75 }}>{ct.discountPercentage || 5}% discount available</span>
      </div>
      <div className="flex-1 w-full rounded-xl flex flex-col items-center justify-center gap-1.5 z-10"
        style={{ border: `1.5px solid ${textColor}20`, background: `${textColor}0A` }}>
        <div className="relative flex items-center justify-center w-[110px] h-[110px]">
          <ProgressCircle size={110} progress={38} track={`${textColor}1A`} stroke={textColor} width={5} />
          <StampCenter stamp={stamp} customStamp={customStamp} color={textColor} size={36} />
        </div>
        <div className="flex items-baseline gap-1 pb-1">
          <span className="text-2xl font-black" style={{ color: textColor }}>38</span>
          <span className="text-xs font-semibold" style={{ color: textColor, opacity: 0.7 }}>pts</span>
        </div>
      </div>
    </div>
  );
};

const L5Card = ({ textColor, stamp, customStamp }) => (
  <div className="w-48 h-[260px] flex flex-col items-center justify-center px-2 pt-2 gap-1.5 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none" />
    <div className="relative flex items-center justify-center w-[130px] h-[130px]" style={{ color: textColor }}>
      <ProgressCircle size={130} progress={30} track={`${textColor}20`} stroke={textColor} width={6} />
      <StampCenter stamp={stamp} customStamp={customStamp} color={textColor} size={48} />
    </div>
    <div className="flex flex-col items-center" style={{ color: textColor }}>
      <p className="text-[9px] opacity-70 uppercase tracking-wider">Points</p>
      <div className="flex items-center gap-0.5">
        <span className="text-2xl font-bold">250</span>
        <Star className="w-4 h-4 fill-current text-yellow-400" />
      </div>
      <p className="text-[9px] opacity-60 mt-0.5">525 pts to next reward</p>
    </div>
  </div>
);

const FlyerCardPreview = ({ store, flyerImages = {} }) => {
  const lc = store.loyaltyCard || {};
  const { format = "L2", cardColor = "#1a1a2e", textColor = "#ffffff", stamp = "coffee", customStamp, stampColor, totalShapes, cardImage, tier } = lc;
  // Use base64 versions from backend proxy when available (fixes CORS in download)
  const safeCustomStamp = flyerImages.customStamp || customStamp;
  const safeCardImage = flyerImages.cardImage || cardImage;
  const safeLogo = flyerImages.logo || store.frontLogo || store.logo;
  const props = { textColor, stamp, customStamp: safeCustomStamp, stampColor, totalShapes, tier, format };

  return (
    <div className="bg-white font-poppins w-full">
      {/* Greeting */}
      <div className="flex items-center justify-between px-3 pt-3 pb-3">
        <div>
          <p className="text-sm font-medium font-rubik text-black">Hello 👋</p>
          <p className="text-base font-semibold text-black -mt-0.5">UserName</p>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
      {/* Store Logo */}
      <div className="flex flex-col items-center mb-3">
        <div className="h-[70px] flex items-center justify-center">
          {(store.frontLogo || store.logo) ? (
            <img src={safeLogo} alt={store.name} className="h-[70px] w-auto max-w-[180px] object-contain" />
          ) : (
            <div className="h-[70px] flex items-center justify-center">
              <span className="text-2xl font-bold text-black">{store.name}</span>
            </div>
          )}
        </div>
        {store.location && <p className="text-xs font-medium text-black tracking-wide">{store.location}</p>}
      </div>
      {/* Loyalty Card */}
      <div className="flex justify-center pb-3">
        <div className="rounded-[14px] relative overflow-hidden" style={{
          backgroundColor: cardColor,
          backgroundImage: safeCardImage ? `url(${safeCardImage})` : "none",
          backgroundSize: "cover", backgroundPosition: "center",
        }}>
          {format === "L1" ? <L1Card {...props} /> : format === "L2" ? <L2Card {...props} />
            : format === "L4" ? <L4Card {...props} /> : format === "L5" ? <L5Card {...props} />
            : <L3Card {...props} />}
        </div>
      </div>
    </div>
  );
};

export default FlyerCardPreview;
