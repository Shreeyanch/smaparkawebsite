import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { Mail, FileEdit, Settings, MessageCircle, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import config from "../api/config";
import { useAuth } from "../context/AuthContext";
import ConfigSMTP from "./ConfigSMTP";
import ConfigSMS from "./ConfigSMS";

const Config = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const store = location.state?.store;
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const queryParams = new URLSearchParams(location.search);
  let status = queryParams.get("status");
  !status && (status = "smtpConfig");

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  Configuration Settings
                </h1>
                <p className="text-sm text-gray-600 mt-1">Store: {store?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() =>
                  navigate(`${location.pathname}?status=smtpConfig`, {
                    state: { store },
                  })
                }
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  status === "smtpConfig"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  status === "smtpConfig" ? "bg-blue-50" : "bg-gray-50"
                }`}>
                  <Mail className={`h-4 w-4 ${
                    status === "smtpConfig" ? "text-blue-600" : "text-gray-400"
                  }`} />
                </div>
                SMTP Configuration
              </button>
              
              <button
                onClick={() =>
                  navigate(`${location.pathname}?status=smsConfig`, {
                    state: { store },
                  })
                }
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  status === "smsConfig"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  status === "smsConfig" ? "bg-blue-50" : "bg-gray-50"
                }`}>
                  <MessageCircle className={`h-4 w-4 ${
                    status === "smsConfig" ? "text-blue-600" : "text-gray-400"
                  }`} />
                </div>
                SMS Configuration
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            {status === "smtpConfig" && <ConfigSMTP store={store} />}
            {status === "smsConfig" && <ConfigSMS store={store}/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
