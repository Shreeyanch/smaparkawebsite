import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Mousewheel, Scrollbar, Keyboard } from "swiper/modules";

const toRgba = (hexColor, alpha = 1) => {
  if (!hexColor || typeof hexColor !== "string") return `rgba(204,204,204,${alpha})`;
  const hex = hexColor.replace("#", "").trim();
  const isValid = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex);
  if (!isValid) return `rgba(204,204,204,${alpha})`;

  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  const value = Number.parseInt(fullHex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r},${g},${b},${alpha})`;
};

const getTierProgress = (tier, points) => {
  const minPoints = Number(tier?.minPoints) || 0;
  const maxPoints = Number(tier?.maxPoints) || 0;

  if (maxPoints <= minPoints) return points >= minPoints ? 100 : 0;

  const rawProgress = ((points - minPoints) / (maxPoints - minPoints)) * 100;
  return Math.max(0, Math.min(100, rawProgress));
};

const getTierRangeText = (tier) => {
  const minPoints = Number(tier?.minPoints) || 0;
  const maxPoints = Number(tier?.maxPoints) || 0;

  if (maxPoints <= minPoints) return `${minPoints}+ pts`;
  return `${minPoints} - ${maxPoints} pts`;
};

const L6TierSwiper = ({ tiers, customerTier, customerPoints, onSlideChange }) => {
  return (
    <div className="max-w-[430px] mx-auto px-4 pt-4">
      <Swiper
        slidesPerView={1}
        spaceBetween={12}
        pagination={true}
        modules={[Pagination, Mousewheel, Scrollbar, Keyboard]}
        className="mySwiper pb-8"
        onSlideChange={onSlideChange}
      >
        {tiers.map((tier, index) => (
          <SwiperSlide key={tier._id || index}>
            <div
              className="rounded-3xl border border-white/60 p-4 text-white shadow-[0_22px_45px_-32px_rgba(24,24,27,0.8)]"
              style={{
                background: `linear-gradient(140deg, ${tier?.color || "#9ca3af"} 0%, ${toRgba(tier?.color, 0.74)} 48%, ${toRgba("#1f2937", 0.88)} 100%)`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/80">Tier</p>
                  <h3 className="mt-1 text-[24px] leading-none font-semibold">{tier?.name || "Untitled"}</h3>
                  <p className="mt-2 text-[12px] text-white/85">{getTierRangeText(tier)}</p>
                </div>
                <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-[11px] font-semibold">
                  {customerTier === tier?.name ? "Current Tier" : "Locked"}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/20 bg-black/15 px-3 py-3">
                <div className="flex items-center justify-between text-[11px] text-white/85">
                  <span>Your progress</span>
                  <span>{Math.round(getTierProgress(tier, customerPoints))}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${getTierProgress(tier, customerPoints)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/85">You have {customerPoints} points</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

L6TierSwiper.propTypes = {
  tiers: PropTypes.arrayOf(PropTypes.object).isRequired,
  customerTier: PropTypes.string,
  customerPoints: PropTypes.number,
  onSlideChange: PropTypes.func.isRequired,
};

export default L6TierSwiper;
