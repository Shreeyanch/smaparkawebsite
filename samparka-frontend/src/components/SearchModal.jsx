import React from "react";
import { X } from "lucide-react";

const SearchModal = ({ isOpen, onClose, setSearchKeyword }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md relative">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Search Input */}
        <h2 className="text-lg font-semibold mb-4 text-center">Search</h2>
        <input
          type="text"
          placeholder="Type to search..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 placeholder-gray-400"
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchModal;
