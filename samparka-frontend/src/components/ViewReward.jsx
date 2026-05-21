import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Calendar,
  Calendar1,
  CalendarCheck,
  CalendarCheck2,
  Gamepad,
  Gamepad2,
  Info,
} from "lucide-react";
import { Leaderboard } from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import InstallationGuide from "./InstallationGuide";

const ViewReward = ({
  className = "",
  location,
  group1410103762,
  vector,
  color,
  storeData,
}) => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  const { isDarkMode } = useTheme();
  return (
    // <div className={`flex items-center justify-between py-2 w-full`}>
    //   <InstallationGuide showGuide={showGuide} setShowGuide={setShowGuide} />

    //   {/* Left Section: Leaderboard */}
    //   <div className="flex items-center">
    //     <div
    //       style={{ backgroundColor: color }}
    //       className="w-[70px] h-12 flex items-center justify-center rounded-tr-md rounded-br-md cursor-pointer transition-transform hover:scale-105"
    //       onClick={() => navigate("/leaderboard")}
    //     >
    //       {/* <Leaderboard className="text-white w-6 h-6" /> */}
    //       <img src="/leaderboard.svg" alt="" className="text-white w-9" />
    //     </div>
    //   </div>

    //   {/* Middle Section: Logo & Location */}
    //   <div className="flex flex-col items-center justify-center gap-1 text-center">
    //     <img
    //       className="w-16 h-16 object-contain"
    //       alt="Logo"
    //       src={group1410103762}
    //     />
    //     <div className="text-sm font-medium tracking-wide">{location}</div>
    //   </div>

    //   {/* Right Section: Info Button */}
    //   <div className="flex items-center">
    //     <div
    //       style={{ backgroundColor: color }}
    //       className="w-[70px] h-12 flex items-center justify-center rounded-tl-md rounded-bl-md cursor-pointer transition-transform"
    //       onClick={() => setShowGuide(true)}
    //     >
    //       <Info className="w-7 h-7 text-white animate-pulse transition-all duration-500 ease-in-out drop-shadow-lg" />
    //     </div>
    //   </div>
    // </div>
    <div
      className={`self-stretch mb-2 flex items-center justify-between text-left text-xs-41 font-poppins lg1:pl-0 lg1:pr-0 lg1:box-border text-black ${className}`}
    >
      {/* Left - Leaderboard (conditional) */}
      {/* {storeData.services?.leaderboard || storeData.services?.reservation ? (
        <div className="flex items-center">
          <InstallationGuide
            showGuide={showGuide}
            setShowGuide={setShowGuide}
          />
          {storeData.services?.reservation ? (
            <div
              style={{ backgroundColor: color }}
              className="w-[70px] h-12 flex items-center justify-center rounded-tr-md rounded-br-md cursor-pointer transition-transform"
              onClick={() => navigate("/reservation")}
            >
              <Calendar className="w-9 text-white" />
            </div>
          ) : (
            <div
              style={{ backgroundColor: color }}
              className="w-[70px] h-12 flex items-center justify-center rounded-tr-md rounded-br-md cursor-pointer transition-transform"
              onClick={() => navigate("/leaderboard")}
            >
              <img src="/leaderboard.svg" alt="" className="text-white w-9" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center">
          <InstallationGuide
            showGuide={showGuide}
            setShowGuide={setShowGuide}
          />
        </div>
      )} */}

      {/* Center - Logo and Location */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center gap-[px]">
        <div className="h-[74px] flex flex-col items-center justify-center">
          <img
            className="w-auto relative h-[70px]"
            alt=""
            src={group1410103762}
          />
        </div>
        <div className={"relative tracking-[0.01em] font-medium text-black"}>
          {location}
        </div>
      </div>
      <br />
      <br />
      {/* Right - Info Icon */}
      {/* {storeData.services?.games ? (
        <div className="flex items-center">
          <div
            style={{ backgroundColor: color }}
            className="w-[70px] rounded-tl-3xs1 rounded-bl-3xs1 flex justify-center py-[9px] px-0 cursor-pointer"
            onClick={() => navigate("/games")}
          >
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <div
            style={{ backgroundColor: color }}
            className="w-[70px] rounded-tl-3xs1 rounded-bl-3xs1 flex justify-center py-[9px] px-0 cursor-pointer"
            onClick={() => setShowGuide(true)}
          >
            <Info className="w-7 h-7 text-white animate-pulse hover:animate-spin transition-all duration-500 ease-in-out drop-shadow-neon" />
          </div>
        </div>
      )} */}
    </div>
  );
};

ViewReward.propTypes = {
  className: PropTypes.string,
  group1410103762: PropTypes.string,
  vector: PropTypes.string,
};

export default ViewReward;
