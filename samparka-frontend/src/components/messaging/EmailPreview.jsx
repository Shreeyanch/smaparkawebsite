import { Mail } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function formatBody(text) {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const formatted = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n+/g, '</p><p style="margin:1em 0 0;">')
    .replace(/\n/g, "<br>");
  return `<p style="margin:0;">${formatted}</p>`;
}

function replaceVariables(text, { storeName, loyaltyUrl }) {
  return (text || "")
    .replace(/\[customer_name\]/g, "John")
    .replace(/\[customer_email\]/g, "john@example.com")
    .replace(/\[store_name\]/g, storeName)
    .replace(/\[store_link\]/g, loyaltyUrl);
}

export default function EmailPreview({
  storeName = "Your Store",
  brandColor = "#016e49",
  brandTextColor = "#ffffff",
  storeUrl = "yourstore",
  subject = "",
  body = "",
  imagePreviewUrl = null,
  ctaText = "",
  ctaUrl = "",
}) {
  const { isDarkMode } = useTheme();

  const loyaltyUrl = `https://${storeUrl}.samparka.co/loyality`;
  const isEmpty = !subject && !body && !imagePreviewUrl;

  // Resolve [store_link] in ctaUrl the same way the backend does
  const resolvedCtaUrl = ctaUrl.replace(/\[store_link\]/g, loyaltyUrl);
  const showCta = ctaText.trim() && resolvedCtaUrl.trim();

  const resolvedBody = replaceVariables(body, { storeName, loyaltyUrl });
  const isHtmlBody = /<[a-z][\s\S]*>/i.test(resolvedBody || "");
  const bodyHtml = isHtmlBody ? resolvedBody : formatBody(resolvedBody);
  const normalizedBodyHtml = bodyHtml.replace(/&nbsp;/g, " ");

  return (
    <div>
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-3">
        <Mail className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
        <h4 className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          Email Preview
        </h4>
      </div>

      {subject && (
        <p className={`text-xs mb-3 px-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <span className="font-semibold">Subject:</span>{" "}
          {subject.replace(/\[customer_name\]/g, "John").replace(/\[store_name\]/g, storeName)}
        </p>
      )}

      {isEmpty ? (
        /* Placeholder when nothing typed yet */
        <div className={`flex flex-col items-center justify-center gap-3 py-16 rounded-lg border-2 border-dashed ${
          isDarkMode ? "border-gray-700 text-gray-600" : "border-gray-200 text-gray-300"
        }`}>
          <Mail className="w-8 h-8" />
          <p className={`text-xs text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            Start filling in subject or body<br />to see a live email preview
          </p>
        </div>
      ) : (
        /* Scaled email mock */
        <div style={{ transform: "scale(0.78)", transformOrigin: "top left", width: "128%", marginBottom: "-22%" }}>
          <div style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "#ffffff",
            fontFamily: "Arial, sans-serif",
          }}>
            {/* Header */}
            <div style={{ backgroundColor: brandColor, padding: "18px 24px", textAlign: "center" }}>
              <span style={{ color: brandTextColor, fontSize: 17, fontWeight: 700, letterSpacing: "0.5px" }}>
                {storeName}
              </span>
            </div>

            {/* Campaign image */}
            {imagePreviewUrl && (
              <div style={{ lineHeight: 0 }}>
                <img src={imagePreviewUrl} alt="Campaign" style={{ width: "100%", display: "block", border: 0 }} />
              </div>
            )}

            {/* Body */}
            <div style={{ padding: "22px 26px", color: "#374151", fontSize: 14, lineHeight: 1.7 }}>
              {resolvedBody ? (
                <div dangerouslySetInnerHTML={{ __html: normalizedBodyHtml }} />
              ) : (
                <p style={{ margin: 0, color: "#9ca3af" }}>Your message will appear here...</p>
              )}
            </div>

            {/* CTA — only shown when label + URL are both filled */}
            {showCta && (
              <div style={{ padding: "0 26px 24px", textAlign: "center" }}>
                <a href={resolvedCtaUrl} style={{
                  display: "inline-block", padding: "10px 26px",
                  backgroundColor: brandColor, color: brandTextColor,
                  textDecoration: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
                }}>
                  {ctaText}
                </a>
              </div>
            )}

            {/* Footer */}
            <div style={{ backgroundColor: "#f9fafb", padding: "14px 26px", textAlign: "center", borderTop: "1px solid #e5e7eb" }}>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: 11 }}>
                You received this email because you are a member of the {storeName} loyalty program.
              </p>
              <p style={{ margin: "4px 0 0", color: "#d1d5db", fontSize: 10 }}>Powered by Samparka</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
