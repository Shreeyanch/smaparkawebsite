import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

// eslint-disable-next-line react/prop-types
const Title = ({ className = "", store, setSearchKeyword }) => {
  const navigate = useNavigate("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div
      className={`self-stretch [filter:drop-shadow(0px_2px_7.1px_rgba(0,_0,_0,_0.05))] border-gray-300 border-b border-solid box-border h-[273px] flex flex-col items-start justify-start pt-0 px-5 pb-2.5 gap-[27px] text-center text-11xl1 text-black font-poppins ${className}`}
    >
      {/* <div className="self-stretch flex flex-row items-center justify-end gap-5 mt-2">
        <button className="cursor-pointer [border:none] p-0 bg-[transparent] w-5 relative h-5">
          <img
            className="absolute top-[0px] left-[0px] w-5 h-5"
            alt=""
            src="/home.svg"
          />
        </button>
        <button className="cursor-pointer [border:none] p-0 bg-[transparent] w-5 relative h-5">
          <img
            className="absolute top-[0px] left-[0px] w-5 h-5"
            alt=""
            src="/search.svg"
          />
        </button>
      </div> */}
      
      <div className="self-stretch flex flex-col items-center justify-center mt-4">
        <img
          className="w-auto h-[85px] object-fit"
          alt="store-name"
          src={store.frontLogo || store.logo}
        />
        <div
          className="flex flex-col items-center justify-center gap-2.5"
          id="Store_id"
        >
          <b className="relative tracking-[0.01em]">{store.name}</b>
          <div className="relative text-xs tracking-[0.01em] font-medium">
            Welcome to {store.name}
          </div>
        </div>
      </div>

      <div className="self-stretch flex flex-row items-center justify-center gap-[30px]">
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer [border:none] p-0 bg-[transparent] flex flex-row items-center justify-center gap-[5px]"
        >
          <img className="w-[20px] relative h-[20px]" alt="" src="/home.svg" />
          <div className="relative text-mini1 tracking-[0.01em] font-medium font-poppins text-darkgray-300 text-center">
            Home
          </div>
        </button>
        <div className="relative flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="cursor-pointer border-none p-2 bg-transparent flex flex-row items-center justify-center gap-2"
          >
            <img className="w-5 h-5" alt="Search Icon" src="/search.svg" />
            <div className="text-sm font-medium text-gray-600">Search</div>
          </button>

          {/* Animated Search Input */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: isSearchOpen ? "200px" : 0,
              opacity: isSearchOpen ? 1 : 0,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full h-8 px-3 py-1 border border-gray-300 rounded-md focus:outline-none text-lg"
            />
          </motion.div>
        </div>
        {/* Search Modal */}
        {/* <SearchModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          setSearchKeyword={setSearchKeyword}
        /> */}
      </div>
    </div>
  );
};

Title.propTypes = {
  className: PropTypes.string,
};

export default Title;
