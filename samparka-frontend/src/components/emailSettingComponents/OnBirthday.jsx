import React, { useEffect, useState } from "react";
import TextEditor from "./TextEditor";
import { toast } from "sonner";
import config from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const PREMADE_SUBJECT = "Happy Birthday [customer_name]! 🎂 A Special Gift Awaits You";
const PREMADE_MESSAGE = `<p>Dear [customer_name],</p><p>🎂 Wishing you a wonderful birthday filled with joy and happiness!</p><p>As a token of our appreciation, we have a special birthday surprise waiting for you. Visit us today and let our team make your day even more memorable.</p><p>You deserve to be celebrated — thank you for being such a valued member of our community.</p><p>With warm birthday wishes,<br/>The Team</p>`;

const OnBirthday = (state) => {
  const [subject, setSubject] = useState(state.mailMessage.subject);
  const [message, setMessage] = useState(state.mailMessage.message);
  useEffect(() => {
    state.onPreviewChange?.({ subject, message });
  }, [subject, message]);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const { isDarkMode } = useTheme();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await config.put(
        `/store/configMessage/${state.store._id}`,
        { subject, message, status: state.status },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    }
  };
  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 shadow-sm`}>
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Birthday Email</h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Configure the special email template sent to customers on their birthday to celebrate with them and strengthen customer loyalty.</p>
      </div>

      {/* Premade Template */}
      <div className={`mb-6 rounded-lg border border-dashed p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Premade Template</p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click to auto-fill with a ready-to-use birthday template</p>
          </div>
          <button
            type="button"
            onClick={() => { setSubject(PREMADE_SUBJECT); setMessage(PREMADE_MESSAGE); }}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter birthday email subject line..."
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900"
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="textEditor"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Message
          </label>
          <div>
            <TextEditor message={message} setMessage={setMessage} />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Save Email Template
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnBirthday;
