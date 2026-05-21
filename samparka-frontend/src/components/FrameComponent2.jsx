import PropTypes from "prop-types";

const FrameComponent2 = ({ className = "" }) => {
  return (
    <div
      className={`w-[270px] flex flex-col items-start justify-start gap-[11px] z-[1] text-left text-sm text-gray font-garet ${className}`}
    >
      <div className="self-stretch flex flex-col items-center justify-center">
        <div className="self-stretch shadow-[0px_0px_3px_rgba(0,_0,_0,_0.08),_0px_2px_3px_rgba(0,_0,_0,_0.17)] rounded-3xs bg-white flex flex-row items-center justify-center py-[7px] px-[15px] gap-[15px]">
          <div className="overflow-hidden flex flex-row items-end justify-start">
            <img className="w-[23px] relative h-[23px]" alt="" src="/c.svg" />
          </div>
          <div className="relative">Facebook</div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-center justify-center">
        <div className="self-stretch shadow-[0px_0px_3px_rgba(0,_0,_0,_0.08),_0px_2px_3px_rgba(0,_0,_0,_0.17)] rounded-3xs bg-white flex flex-row items-center justify-center py-[7px] px-[15px] gap-[15px]">
          <div className="overflow-hidden flex flex-row items-center justify-start relative gap-2.5">
            <img
              className="w-[23px] relative h-[23px] z-[0]"
              alt=""
              src="/vector1.svg"
            />
            <img
              className="w-[51.3%] absolute !m-[0] h-[51.3%] top-[24.35%] right-[24.35%] bottom-[24.35%] left-[24.35%] max-w-full overflow-hidden max-h-full z-[1]"
              alt=""
              src="/vector2.svg"
            />
            <img
              className="w-[12.17%] absolute !m-[0] h-[12.17%] top-[17.39%] right-[16.96%] bottom-[70.43%] left-[70.87%] max-w-full overflow-hidden max-h-full z-[2]"
              alt=""
              src="/vector3.svg"
            />
          </div>
          <div className="relative">Instagram</div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-center justify-center">
        <div className="self-stretch shadow-[0px_0px_3px_rgba(0,_0,_0,_0.08),_0px_2px_3px_rgba(0,_0,_0,_0.17)] rounded-3xs bg-white flex flex-row items-center justify-center py-[7px] px-[15px] gap-[15px]">
          <img
            className="w-[23px] relative h-[23px]"
            alt=""
            src="/social-icons.svg"
          />
          <div className="relative">Tiktok</div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-center justify-center">
        <div className="self-stretch shadow-[0px_0px_3px_rgba(0,_0,_0,_0.08),_0px_2px_3px_rgba(0,_0,_0,_0.17)] rounded-3xs bg-white flex flex-row items-center justify-center py-[7px] px-[15px] gap-[15px]">
          <img
            className="w-[23px] relative h-[23px]"
            alt=""
            src="/google-logo.svg"
          />
          <div className="relative">Google Review</div>
        </div>
      </div>
    </div>
  );
};

FrameComponent2.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent2;
