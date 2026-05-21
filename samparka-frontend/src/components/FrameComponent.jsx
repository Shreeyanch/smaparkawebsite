import PropTypes from "prop-types";

const FrameComponent = ({ className = "" }) => {
  return (
    <form
      className={`m-0 w-[270px] flex flex-col items-start justify-start gap-[11px] z-[2] ${className}`}
    >
      <div className="w-[270px] [filter:drop-shadow(0px_0px_2px_rgba(0,_0,_0,_0.25)_inset)] rounded border-sienna border-[1px] border-solid box-border h-[30px] flex flex-row items-center justify-center py-[7px] px-3">
        <div className="flex-1 relative text-3xs font-garet text-darkgray-200 text-left">
          Table no
        </div>
      </div>
      <div className="w-[270px] [filter:drop-shadow(0px_0px_2px_rgba(0,_0,_0,_0.25)_inset)] rounded border-sienna border-[1px] border-solid box-border h-[30px] flex flex-row items-center justify-center py-[7px] px-3">
        <div className="flex-1 relative text-3xs font-garet text-darkgray-200 text-left">
          Name
        </div>
      </div>
      <div className="w-[270px] [filter:drop-shadow(0px_0px_2px_rgba(0,_0,_0,_0.25)_inset)] rounded border-sienna border-[1px] border-solid box-border h-[30px] flex flex-row items-center justify-center py-[7px] px-3 gap-2.5">
        <div className="flex-1 relative text-3xs font-garet text-darkgray-200 text-left">
          Phone no
        </div>
        <img
          className="w-6 relative h-6 overflow-hidden shrink-0"
          alt=""
          src="/uphonealt.svg"
        />
      </div>
      <div className="w-[270px] [filter:drop-shadow(0px_0px_2px_rgba(0,_0,_0,_0.25)_inset)] rounded border-sienna border-[1px] border-solid box-border h-[30px] flex flex-row items-center justify-center py-[7px] px-3 gap-2.5">
        <div className="flex-1 relative text-3xs font-garet text-darkgray-200 text-left">
          Date
        </div>
        <img
          className="w-6 relative h-6 overflow-hidden shrink-0"
          alt=""
          src="/calendar.svg"
        />
      </div>
      <div className="w-[270px] rounded h-[30px] flex flex-row items-center justify-center py-[7px] px-0 box-border gap-2.5">
        <div className="flex-1 [filter:drop-shadow(0px_0px_2px_rgba(0,_0,_0,_0.25)_inset)] rounded border-sienna border-[1px] border-solid box-border h-[30px] flex flex-row items-center justify-center py-[7px] px-3 gap-2.5">
          <div className="flex-1 relative text-3xs font-garet text-darkgray-200 text-left">
            Guests
          </div>
          <img
            className="w-6 relative h-6 overflow-hidden shrink-0"
            alt=""
            src="/uusersalt.svg"
          />
        </div>
        <div className="flex-1 [filter:drop-shadow(0px_0px_2px_rgba(0,_0,_0,_0.25)_inset)] rounded border-sienna border-[1px] border-solid box-border h-[30px] flex flex-row items-center justify-center py-[7px] px-3 gap-2.5">
          <div className="flex-1 relative text-3xs font-garet text-darkgray-200 text-left">
            Time
          </div>
          <img
            className="w-6 relative h-6 overflow-hidden shrink-0"
            alt=""
            src="/uclock.svg"
          />
        </div>
      </div>
      <div className="self-stretch rounded-6xs bg-seagreen-100 border-whitesmoke-100 border-[1px] border-solid flex flex-row items-end justify-center py-[9px] px-0 lg:gap-2.5">
        <div className="relative text-sm tracking-[0.01em] leading-[149.7%] font-medium font-poppins text-white text-left">
          Confirm
        </div>
      </div>
    </form>
  );
};

FrameComponent.propTypes = {
  className: PropTypes.string,
};

export default FrameComponent;
