import { useEffect, useState } from "react";
import api from "../api/config";

const SubscriptionExpired = ({ subdomain, isCustomerView = false }) => {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchStoreName = async () => {
      if (subdomain) {
        try {
          // Try to fetch store details
          const response = await api.get(`/store/checkStore/${subdomain}`);
          if (response.data.store?.name) {
            setDisplayName(response.data.store.name);
          } else {
            // Format subdomain as fallback
            const formatted = subdomain
              .split(/[-_]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            setDisplayName(formatted);
          }
        } catch (error) {
          // Fallback to formatted subdomain
          const formatted = subdomain
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setDisplayName(formatted);
        }
      }
    };
    fetchStoreName();
  }, [subdomain]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Subscription Expired
          </h1>
          <p className="text-gray-600 mb-6">
            {isCustomerView && displayName
              ? <span>Please contact <span className="font-bold">{displayName}</span> for assistance.</span>
              : "Your subscription has ended. Please contact us to renew your access."}
          </p>
        </div>

        {!isCustomerView && (
          <div className="space-y-4">
          <a
            href={`https://wa.me/9779766387030?text=Hello%2C%20I%20need%20help%20with%20my%20subscription%20renewal%20for%20${encodeURIComponent(displayName || subdomain)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Contact Support
          </a>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Need help?</p>
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href="mailto:hello@samparka.co"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                hello@samparka.co
              </a>
              <a
                href="tel:+9779766387030"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                +977 9766387030
              </a>
            </div>
          </div>
        </div>        )}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-gray-400">Powered by</p>
            <a 
              href="https://www.samparka.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <img 
                src="/images/logo/logo_black.png" 
                alt="Samparka" 
                className="h-10 hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpired;
