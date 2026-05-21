import { Save } from "lucide-react";
import React from "react";

const CustomizeRewardTemplate = ({
  templateData,
  handleUpdate,
  handleSubmit,
}) => {
  const { image, bgColor, textColor, buttonColor } = templateData;

  return (
    <div className="max-w-lg w-full bg-stone-900 p-6 rounded-lg shadow-md space-y-4">
      {/* Form Inputs */}
      <div className="space-y-4">
        {/* Upload Image */}
        <div>
          <label className="block text-sm font-medium text-stone-400 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpdate("image", e.target.files[0])}
            className="block w-full text-sm text-stone-300 bg-stone-800 border border-stone-600 rounded-lg cursor-pointer"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-stone-400 mb-2">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={templateData.bgColor}
              onChange={(e) => handleUpdate("bgColor", e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-stone-300 bg-stone-800 border border-stone-600 rounded-lg"
            />
            <input
              type="color"
              value={templateData.bgColor}
              onChange={(e) => handleUpdate("bgColor", e.target.value)}
              className="h-10 w-10 rounded-lg border border-stone-600"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-stone-400 mb-2">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={templateData.textColor}
              onChange={(e) => handleUpdate("textColor", e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-stone-300 bg-stone-800 border border-stone-600 rounded-lg"
            />
            <input
              type="color"
              value={templateData.textColor}
              onChange={(e) => handleUpdate("textColor", e.target.value)}
              className="h-10 w-10 rounded-lg border border-stone-600"
            />
          </div>
        </div>

        {/* Button Color */}
        <div>
          <label className="block text-sm font-medium text-stone-400 mb-2">
            Button Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={templateData.buttonColor}
              onChange={(e) => handleUpdate("buttonColor", e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-stone-300 bg-stone-800 border border-stone-600 rounded-lg"
            />
            <input
              type="color"
              value={templateData.buttonColor}
              onChange={(e) => handleUpdate("buttonColor", e.target.value)}
              className="h-10 w-10 rounded-lg border border-stone-600"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-[#3A2F2F] text-white px-6 py-2 rounded-lg hover:bg-[#2A1F1F] transition-colors"
        >
          <Save size={18} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default CustomizeRewardTemplate;
