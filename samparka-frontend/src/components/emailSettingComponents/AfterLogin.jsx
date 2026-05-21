import React, { useEffect, useState } from "react";
import TextEditor from "./TextEditor";
import { toast } from "sonner";
import config from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const PREMADE_SUBJECT = "Welcome to Our Loyalty Program!";
const PREMADE_MESSAGE = `<p>Dear [customer_name],</p><p>Welcome! We're thrilled to have you as part of our loyalty family.</p><p>Every visit earns you points that you can redeem for amazing rewards. The more you visit, the more you save!</p><p>Thank you for choosing us — we can't wait to reward your loyalty.</p><p>Warm regards,<br/>The Team</p>`;

const AfterLogin = (state) => {
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
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>After User's First Login</h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Configure the email template sent to users after their first login to your store.</p>
      </div>

      {/* Premade Template */}
      <div className={`mb-6 rounded-lg border border-dashed p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Premade Template</p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click to auto-fill with a ready-to-use welcome template</p>
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
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
          >
            Email Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject line..."
            className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors`}
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="textEditor"
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
          >
            Email Message
          </label>
          <div className="min-h-[400px]">
            <TextEditor message={message} setMessage={setMessage} />
          </div>
        </div>

        <div className={`flex justify-end pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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

export default AfterLogin;
