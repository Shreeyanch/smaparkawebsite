// import PropTypes from "prop-types";

// const Description = ({ className = "", onClose }) => {
//   return (
//     <div
//       className={`w-[361px] relative rounded-3xs bg-seagreen-200 h-48 flex flex-col items-center justify-center py-2.5 px-0 box-border gap-2.5 max-w-full max-h-full overflow-auto text-center text-[12px] text-white font-garet ${className}`}
//     >
//       <div className="relative tracking-[0.01em] z-[0] lg:text-black mq350small:font-garet mq350small:text-xl mq350small:text-black">
//         <span>Description!</span>
//         <span className="font-medium font-rubik">👋🏼</span>
//       </div>
//       <img
//         className="w-[2.77%] absolute !m-[0] h-[5.21%] top-[7.81%] right-[3.88%] bottom-[86.98%] left-[93.35%] max-w-full overflow-hidden max-h-full z-[1]"
//         alt=""
//         src="/x.svg"
//       />
//     </div>
//   );
// };

// Description.propTypes = {
//   className: PropTypes.string,
//   onClose: PropTypes.func,
// };

// export default Description;

import PropTypes from "prop-types";

const Description = ({ className = "", onClose, description }) => {
  return (
    <div
      className={`w-[361px] relative rounded-3xs1 bg-seagreen-200 h-60 flex flex-col items-center justify-center py-2.5 px-0 box-border gap-2.5 max-w-full max-h-full overflow-auto text-center text-[12px] text-white ${className}`}
    >
      <div className="relative tracking-[0.01em] z-[0] lg:text-black mq350small1:text-xl mq350small1:text-black">
        <span>{description}</span>
      </div>

      <img
        className="w-[20px] h-[20px] absolute !m-[0] top-[7.81%] right-[3.88%] max-w-full overflow-hidden max-h-full z-[1]"
        alt=""
        src="/x.svg"
        onClick={onClose}
      />
    </div>
  );
};

Description.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default Description;
