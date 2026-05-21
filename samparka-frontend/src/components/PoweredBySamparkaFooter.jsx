const PoweredBySamparkaFooter = () => {
  return (
    <div className="flex flex-row pb-5 items-center justify-center gap-2 z-6 text-3xs1 text-darkslategray-100 font-poppins bg-white">
      <a
        href="https://www.samparka.co/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
      >
        <p className="text-2xs1 text-center">Powered By</p>
        <img
          src="/SAMPARKA.png"
          alt="Samparka Logo"
          className="w-[80px] object-contain"
        />
      </a>
    </div>
  );
};

export default PoweredBySamparkaFooter;
