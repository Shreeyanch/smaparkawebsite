import React from 'react';
import QRCode from "react-qr-code";

const CustomerQr = ({ onClose, user }) => {
  // If user is not available, return null
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 overflow-hidden">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-xs box-border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Customer QR</h2>
          <button onClick={onClose} className="text-lg">×</button>
        </div>
        <div className="mt-4">
          
          <QRCode title="Customer QR" value={user._id} />
          <div className="mt-2">
            <p className="text-center">{user.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerQr;
