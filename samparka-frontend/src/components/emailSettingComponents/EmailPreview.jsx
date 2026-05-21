import { useTheme } from "../../context/ThemeContext";

const EmailPreview = ({ subject, message, store }) => {
  const { isDarkMode } = useTheme();
  const cardColor = store?.loyaltyCard?.cardColor || "#016e49";
  const textColor = store?.loyaltyCard?.textColor || "#ffffff";
  const storeName = store?.name || "Your Store";
  const fromEmail = store?.email || "noreply@store.com";
  const loyaltyURL = `https://${store?.url || "store"}.samparka.co/loyality`;

  const isEmpty = !message || message === "<p><br></p>" || message.trim() === "";

  return (
    <div
      className={`rounded-lg border shadow-sm ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Panel header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h3
            className={`text-sm font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Email Preview
          </h3>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            isDarkMode
              ? "bg-green-900/40 text-green-400 border border-green-700"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}
        >
          Live
        </span>
      </div>

      <div className="p-3">
        {/* Email client chrome */}
        <div
          className={`rounded-lg overflow-hidden border text-[11px] ${
            isDarkMode ? "border-gray-600" : "border-gray-200"
          }`}
        >
          {/* Client top bar */}
          <div
            className={`px-3 pt-2.5 pb-2 border-b ${
              isDarkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex gap-1.5 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <p
              className={`font-semibold text-[11px] truncate mb-0.5 ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {subject || (
                <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>
                  No subject set
                </span>
              )}
            </p>
            <p
              className={`text-[10px] truncate ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              From: {fromEmail}
            </p>
          </div>

          {/* Email body area */}
          <div
            className={`p-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <div className="bg-white rounded overflow-hidden shadow-sm">
              {/* Store header */}
              <div
                style={{ backgroundColor: cardColor }}
                className="px-4 py-3 text-center"
              >
                <span
                  style={{ color: textColor }}
                  className="font-bold text-[13px] tracking-wide"
                >
                  {storeName}
                </span>
              </div>

              {/* Message body */}
              <div className="px-4 py-3">
                {isEmpty ? (
                  <p className="text-[10px] text-gray-300 italic text-center py-2">
                    Your email content will appear here...
                  </p>
                ) : (
                  <div
                    className="text-[10px] text-gray-700 leading-relaxed [&_p]:mb-1.5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-3 [&_ol]:list-decimal [&_ol]:pl-3 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: message }}
                  />
                )}
              </div>

              {/* CTA button */}
              <div className="px-4 pb-3 text-center">
                <a
                  href={loyaltyURL}
                  style={{ backgroundColor: cardColor, color: textColor }}
                  className="inline-block px-5 py-1.5 rounded text-[10px] font-semibold no-underline"
                >
                  View My Points
                </a>
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                <p className="text-[9px] text-gray-400 leading-relaxed">
                  You received this because you are a member of the{" "}
                  <strong>{storeName}</strong> loyalty program.
                </p>
                <p className="text-[8px] text-gray-300 mt-0.5">
                  Powered by Samparka
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Color chips */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Brand colors:
          </span>
          <div className="flex items-center gap-1.5">
            <span
              title="Card color"
              style={{ backgroundColor: cardColor }}
              className="w-4 h-4 rounded border border-black/10"
            />
            <span
              title="Text color"
              style={{ backgroundColor: textColor }}
              className="w-4 h-4 rounded border border-black/10"
            />
          </div>
          <span className={`text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            from loyalty card
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
