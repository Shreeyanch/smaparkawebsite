import { CheckCircle, AlertCircle, Send, Loader2, XCircle } from "lucide-react";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ConfigSMTP = ({ store }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: store?.email || '',
    pass: store?.pass || '',
    host: store?.host || '',
    port: store?.port || '',
    secure: store?.secure === true ? 'ssl' : (typeof store?.secure === 'string' ? store.secure : 'tls'),
  });
  const [showPassword, setShowPassword] = useState(false);
  const isConfigured = !!(store?.email && store?.pass);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();

  // SMTP tester state
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: bool, message: string }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(
        `/store/config/${store._id}`,
        { ...formData },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
          onAutoClose: () => {
            navigate("/store");
          },
        });
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMTP = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      setTestResult({ success: false, message: 'Please enter a recipient email address.' });
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await api.post(
        `/store/testSMTP/${store._id}`,
        { to: testEmail },
        { headers: { token } }
      );
      setTestResult({ success: response.data.success, message: response.data.message });
    } catch (error) {
      setTestResult({ success: false, message: error.message || 'Request failed.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div>
      {loading && <LoadingSpinner />}

      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>SMTP Configuration</h3>

          {isConfigured ? (
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${
              isDarkMode
                ? 'bg-green-900/20 border-green-700/40 text-green-300'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-semibold">Already Configured</p>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                  SMTP is set up with <span className="font-medium">{store.email}</span> via{' '}
                  <span className="font-medium">{store.host || 'your mail server'}</span>
                  {store.port ? ` on port ${store.port}` : ''}. Update the fields below to change your configuration.
                </p>
              </div>
            </div>
          ) : (
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${
              isDarkMode
                ? 'bg-amber-900/20 border-amber-700/40 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-semibold">SMTP Not Configured</p>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  Fill in your email server details below to enable email notifications for your store.
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="your-email@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="pass" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              App Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="pass"
                name="pass"
                value={formData.pass || ''}
                onChange={handleChange}
                placeholder="Enter your app password"
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-3 flex items-center transition-colors ${
                  isDarkMode
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* SMTP Host */}
          <div>
            <label htmlFor="host" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              SMTP Host
            </label>
            <input
              type="text"
              id="host"
              name="host"
              value={formData.host || ''}
              onChange={handleChange}
              placeholder="smtp.gmail.com"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* SMTP Port */}
          <div>
            <label htmlFor="port" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              SMTP Port
            </label>
            <input
              type="number"
              id="port"
              name="port"
              value={formData.port || ''}
              onChange={handleChange}
              placeholder="587"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Security */}
          <div>
            <label htmlFor="secure" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Security
            </label>
            <select
              id="secure"
              name="secure"
              value={formData.secure}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="none">None</option>
              <option value="tls">TLS — STARTTLS (recommended, port 587)</option>
              <option value="ssl">SSL — Implicit TLS (port 465)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className={`pt-4 border-t ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Saving...' : 'Save SMTP Configuration'}
            </button>
          </div>
        </form>

        {/* SMTP Tester */}
        {isConfigured && (
          <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Test SMTP Configuration
            </h4>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Send a test email using your saved SMTP settings to verify delivery is working.
            </p>

            <form onSubmit={handleTestSMTP} className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => { setTestEmail(e.target.value); setTestResult(null); }}
                placeholder="Recipient email address"
                className={`flex-1 min-w-0 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                type="submit"
                disabled={testLoading || !testEmail}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {testLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                  : <><Send size={14} /> Send Test</>
                }
              </button>
            </form>

            {testResult && (
              <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg border text-sm ${
                testResult.success
                  ? isDarkMode
                    ? 'bg-green-900/20 border-green-700/40 text-green-300'
                    : 'bg-green-50 border-green-200 text-green-800'
                  : isDarkMode
                    ? 'bg-red-900/20 border-red-700/40 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {testResult.success
                  ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                  : <XCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                }
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigSMTP;
