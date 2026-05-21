// import PropTypes from "prop-types";

// const FrameTell = ({ className = "", onClose }) => {
//   return (
//     <div
//       className={`w-[305px] relative h-[389px] max-w-full max-h-full overflow-auto ${className}`}
//     >
//       <img
//         className="absolute top-[0px] left-[0px] rounded-xl w-[305px] h-[389px] object-cover"
//         alt=""
//         src="/rectangle-2@2x.png"
//       />
//       <img
//         className="absolute top-[0px] left-[0px] rounded-xl w-[305px] h-[389px] object-cover"
//         alt=""
//         src="/rectangle-2@2x.png"
//       />
//     </div>
//   );
// };

// FrameTell.propTypes = {
//   className: PropTypes.string,
//   onClose: PropTypes.func,
// };

// export default FrameTell;

import PropTypes from "prop-types";

const FrameTell = ({ className = "", onClose, image }) => {
  return (
    <div
      className={`w-full relative flex flex-row items-center justify-start gap-2.5 max-w-full max-h-full overflow-auto ${className}`}
    >
      <img
        className="w-auto h-full object-fill z-[0]" // Ensure it covers the div properly
        alt=""
        src={image}
      />
      {/* Close button positioned at the top-right corner */}
      <img
        className="w-[21px] absolute top-2 right-2 h-[21px] cursor-pointer z-[1]"
        alt=""
        src="/frame-1410103927.svg"
        onClick={onClose}
      />
    </div>
  );
};

FrameTell.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default FrameTell;
