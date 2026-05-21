import React from "react";

const Thankyou = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        {/* Thank You Animation GIF */}
        <img
          src="https://media.giphy.com/media/hxERQNWQudqSF1iDnr/giphy.gif"
          alt="Thank You"
          className="mx-auto w-48 h-48 mb-6"
        />

        {/* Text Content */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-600">
          Your vote has been successfully submitted.
        </p>
      </div>
    </div>
  );
};

export default Thankyou;
