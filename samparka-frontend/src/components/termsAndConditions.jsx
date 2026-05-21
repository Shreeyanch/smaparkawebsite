import React from "react";
import { createPortal } from "react-dom";

const termsAndConditions = ({ onAccept }) => {
  return createPortal(
    <div className="fixed inset-0 z-[90] bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Terms & Conditions
        </h2>

        <div className="text-sm text-gray-700 space-y-4">
          <p>
            Welcome to <strong>SAMPARKA</strong> — a digital loyalty solution
            platform designed to connect customers with their favorite stores
            through digital point rewards.
          </p>

          <p>By using our services, you agree to the following terms:</p>

          {/* Scrollable Terms Section */}
          <div className="max-h-48 overflow-y-auto pr-2">
            <ul className="list-disc ml-5 space-y-2">
              <li>
                Points earned are non-transferable and can only be redeemed at
                participating stores.
              </li>
              <li>
                Each customer can scan and receive points once per day per
                store.
              </li>
              <li>
                Points will only be issued if the customer scans the store’s QR
                code successfully.
              </li>
              <li>
                The store reserves the right to modify point values, rewards, or
                program rules at any time.
              </li>
              <li>
                SAMPARKA may send notifications, emails, and SMS messages
                related to your loyalty activity. By accepting, you agree to
                receive these communications.
              </li>
              <li>
                You are responsible for keeping your contact details updated to
                ensure timely delivery of notifications and reward updates.
              </li>
              <li>
                We may collect and process limited data like phone number,
                location, and reward interactions for service functionality and
                analytics. Your data is stored securely and not shared with
                third parties without consent.
              </li>
              <li>
                Misuse of the QR scanning system (multiple accounts, spoofing,
                automation) will result in disqualification from the loyalty
                program.
              </li>
              <li>
                SAMPARKA is not liable for any dispute between customers and
                stores regarding rewards or point redemption.
              </li>
              <li>
                Continued use of the app indicates your agreement to these
                terms. We may update these policies from time to time.
              </li>
            </ul>
          </div>

          <p>
            If you have questions or concerns, contact us via the in-app help
            section or at{" "}
            <a
              href="mailto:samparkaservices@gmail.com"
              className="text-blue-600 underline"
            >
              samparkaservices@gmail.com
            </a>
            .
          </p>
        </div>

        {/* Accept Button OUTSIDE scrollable area */}
        <div className="text-center mt-6">
          <button
            onClick={onAccept}
            className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default termsAndConditions;
