import PropTypes from "prop-types";
import { useState } from "react";

const FrameComponent3 = ({ className = "", redemption }) => {
  const [status, setStatus] = useState("");

  switch (redemption.status) {
    case "pending":
      setStatus("Pending Approval");
      break;
    case "clamed":
      setStatus("Reward Clamed");
      break;
    case "expired":
      setStatus("Reward Expired");
      break;

    default:
      break;
  }
  return (
    <div className="self-stretch flex flex-row items-center justify-center flex-wrap content-center gap-[53px] text-left text-xs-4 text-black font-poppins">
      {/* Add your Reward component content here */}
      <div className="w-[270px] shadow-[0px_4px_12.2px_rgba(0,_0,_0,_0.25)] rounded-3xs1 bg-white h-58 flex flex-col items-center justify-start py-4 px-4 box-border relative gap-2.5">
        <div className="self-stretch flex flex-row items-center justify-center gap-[3px]">
          <div className="w-2.5 relative rounded-62xl1 bg-lime border-whitesmoke-200 border-[1px] border-solid box-border h-2.5" />
          <div className="flex flex-row items-center justify-center">
            <div className="relative font-medium">{status}</div>
          </div>
        </div>
        <div className="self-stretch flex-1 flex flex-col items-start justify-center gap-2.5 text-left">
          <div className="self-stretch flex flex-col items-start justify-center py-0 px-3.5 gap-px">
            <div className="self-stretch flex flex-row items-center justify-start">
              <div className="w-[125.9px] relative font-medium inline-block shrink-0">
                Grape Flavoured Latte
              </div>
            </div>
            <div className="self-stretch relative font-montserrat text-darkgray-200">
              20 Points
            </div>
          </div>
          <div className="self-stretch h-[34px] flex flex-row items-center justify-center py-0 px-3.5 box-border">
            <div className="flex-1 relative">
              <p className="m-0">
                <span className="font-medium">{`Redeem Date: `}</span>
                <span className="font-montserrat text-darkgray-200">
                  11th Jan 2025
                </span>
              </p>
              <p className="m-0">
                <span className="font-medium">{`Expiry Date: `}</span>
                <span className="font-montserrat text-darkgray-200">
                  11th Feb 2025
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="w-[218px] shadow-[0px_0px_2px_rgba(0,_0,_0,_0.25)_inset] rounded bg-white border-white border-[1px] border-solid box-border h-6 flex flex-row items-center justify-center">
          <input
            className="[border:none] [outline:none] font-garet text-3xs1 bg-[transparent] flex-1 relative text-darkgray-200 text-center"
            placeholder="Store-issued code"
            type="text"
          />
          <button className="cursor-pointer border-white border-[1px] border-solid py-0 px-2 bg-seagreen-100 w-[37px] shadow-[0px_0px_2px_rgba(0,_0,_0,_0.25)_inset] rounded box-border h-6 flex flex-row items-center justify-center relative">
            <img
              className="w-[43.51%] absolute !m-[0] h-[45.83%] top-[25%] right-[22.97%] bottom-[29.17%] left-[33.51%] max-w-full overflow-hidden max-h-full z-[0]"
              alt=""
              src="/tick.svg"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

FrameComponent3.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent3;
