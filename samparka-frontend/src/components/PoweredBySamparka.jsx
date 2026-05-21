import PropTypes from "prop-types";

const PoweredBySamparka = ({ className = "", img }) => {
  return (
    <div
      className={`fixed inset-0 bg-white flex flex-col items-center justify-center text-right text-2xs text-darkslategray-100 font-poppins ${className}`}
    >
      <div className="flex flex-row items-center justify-center gap-2 z-6 text-3xs1 text-darkslategray-100 font-poppins mt-8">
        {img ? (
          <img
            src={img}
            alt="Samparka Logo"
            className="w-[100px] object-contain"
          />
        ) : (
          <a
            href="https://www.samparka.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <p className="text-sm text-center">Powered By</p>
            <img
              src="/SAMPARKA.png"
              alt="Samparka Logo"
              className="w-[100px] object-contain"
            />
          </a>
        )}
      </div>
    </div>
  );
};

PoweredBySamparka.propTypes = {
  className: PropTypes.string,
};

export default PoweredBySamparka;
