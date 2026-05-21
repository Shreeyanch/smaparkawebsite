import { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { MessageSquare, Bell, Mail, MessageCircle, Info, ImagePlus, X, ExternalLink } from "lucide-react";
import EmailPreview from "./EmailPreview";
import EmailBodyEditor from "./EmailBodyEditor";

const CHANNELS = [
  { id: "push", label: "Push Notification", icon: Bell, enabled: true },
  { id: "sms", label: "SMS", icon: MessageSquare, enabled: true },
  { id: "email", label: "Email", icon: Mail, enabled: true },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, enabled: false, comingSoon: true },
];

const VARIABLE_PLACEHOLDERS = [
  { key: "[customer_name]", description: "Customer's name" },
  { key: "[customer_email]", description: "Customer's email address" },
  { key: "[store_name]", description: "Store name" },
  { key: "[store_link]", description: "Store loyalty page link" },
];

export default function MessageComposer({
  channel,
  onChannelChange,
  messageType,
  onMessageTypeChange,
  templateId,
  onTemplateSelect,
  customMessage,
  onCustomMessageChange,
  templates = [],
  storeData = null,
  campaignImagePreview = null,
  isUploadingImage = false,
  onImageSelect,
  onImageRemove,
}) {
  const { isDarkMode } = useTheme();

  const emailEditorRef = useRef(null);

  const handleInsertVariable = (variable) => {
    if (channel === "email" && messageType === "custom" && emailEditorRef.current?.insertVariable) {
      emailEditorRef.current.insertVariable(variable);
      return;
    }
    onCustomMessageChange({
      ...customMessage,
      body: (customMessage.body || "") + variable,
    });
  };

  const selectedTemplate = templates.find((t) => t.id === templateId);

  return (
    <div className="space-y-6">
      {/* Channel selection */}
      <div>
        <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          Select Channel
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isSelected = channel === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => ch.enabled && onChannelChange(ch.id)}
                disabled={!ch.enabled}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                  !ch.enabled
                    ? isDarkMode
                      ? "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : isSelected
                    ? isDarkMode
                      ? "bg-[#4caf50] text-white"
                      : "bg-[#4caf50] text-white"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{ch.label}</span>
                {ch.comingSoon && (
                  <span className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded ${
                    isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
                  }`}>
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message type toggle */}
      <div>
        <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          Message Type
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onMessageTypeChange("custom")}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              messageType === "custom"
                ? isDarkMode
                  ? "bg-[#4caf50] text-white"
                  : "bg-[#4caf50] text-white"
                : isDarkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Write Custom Message
          </button>
          <button
            onClick={() => onMessageTypeChange("template")}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              messageType === "template"
                ? isDarkMode
                  ? "bg-[#4caf50] text-white"
                  : "bg-[#4caf50] text-white"
                : isDarkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Use Template
          </button>
        </div>
      </div>

      {/* Template selection */}
      {messageType === "template" && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Select Template
          </label>
          <select
            value={templateId}
            onChange={(e) => onTemplateSelect(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <option value="">Choose a template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Template preview */}
          {selectedTemplate && (
            <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Preview
              </h4>
              {channel === "email" && selectedTemplate.subject && (
                <p className={`text-xs font-semibold mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Subject: {selectedTemplate.subject}
                </p>
              )}
              {selectedTemplate.title && channel !== "email" && (
                <p className={`font-medium mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {selectedTemplate.title}
                </p>
              )}
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {selectedTemplate.body || selectedTemplate.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Custom message editor */}
      {messageType === "custom" && (
        channel === "email" ? (
          /* ── Email: two-column compose + live preview ── */
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

            {/* LEFT — compose fields */}
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customMessage.subject || ""}
                  onChange={(e) => onCustomMessageChange({ ...customMessage, subject: e.target.value })}
                  placeholder="e.g., A special reward is waiting for you!"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Campaign Image */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Campaign Image{" "}
                  <span className={`text-xs font-normal ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>(optional — appears below the header)</span>
                </label>
                {campaignImagePreview ? (
                  <div className="relative">
                    <img src={campaignImagePreview} alt="Campaign" className="w-full rounded-lg object-cover max-h-40" />
                    <button
                      onClick={onImageRemove}
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                    {isUploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className={`flex flex-col items-center gap-2 p-5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                    isDarkMode ? "border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-300" : "border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-500"
                  }`}>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onImageSelect(e.target.files[0])} />
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-sm">Click to upload campaign image</span>
                    <span className="text-xs">JPG, PNG, GIF up to 5MB</span>
                  </label>
                )}
              </div>

              {/* Email body */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Email Body
                </label>
                <EmailBodyEditor
                  ref={emailEditorRef}
                  value={customMessage.body || ""}
                  onChange={(html) => onCustomMessageChange({ ...customMessage, body: html })}
                />
              </div>

              {/* Variable helpers */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Click to insert variable placeholders
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {VARIABLE_PLACEHOLDERS.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => handleInsertVariable(v.key)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        isDarkMode ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                      }`}
                      title={v.description}
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Button (optional) */}
              <div className={`rounded-lg border p-4 ${isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <h4 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Call-to-Action Button
                  </h4>
                  <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>(optional)</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={customMessage.ctaText || ""}
                      onChange={(e) => onCustomMessageChange({ ...customMessage, ctaText: e.target.value })}
                      placeholder="e.g., View My Points, Claim Your Reward"
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Button URL
                    </label>
                    <input
                      type="text"
                      value={customMessage.ctaUrl || ""}
                      onChange={(e) => onCustomMessageChange({ ...customMessage, ctaUrl: e.target.value })}
                      placeholder="https://... or [store_link]"
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Use <code className={isDarkMode ? "text-green-400" : "text-green-600"}>[store_link]</code> to auto-link to the loyalty page
                    </p>
                  </div>
                  {(!customMessage.ctaText || !customMessage.ctaUrl) && (
                    <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Fill in both fields above to show a button in the email
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — live email preview (always visible) */}
            <div className={`rounded-xl border p-4 xl:sticky xl:top-4 xl:self-start overflow-hidden ${
              isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-200"
            }`}>
              <EmailPreview
                storeName={storeData?.name || "Your Store"}
                brandColor={storeData?.loyaltyCard?.cardColor || "#016e49"}
                brandTextColor={storeData?.loyaltyCard?.textColor || "#ffffff"}
                storeUrl={storeData?.url || "yourstore"}
                subject={customMessage.subject}
                body={customMessage.body}
                imagePreviewUrl={campaignImagePreview}
                ctaText={customMessage.ctaText || ""}
                ctaUrl={customMessage.ctaUrl || ""}
              />
            </div>
          </div>
        ) : (
          /* ── Push / SMS: single column ── */
          <div className="space-y-4">
            {/* Title (push only) */}
            {channel === "push" && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Notification Title
                </label>
                <input
                  type="text"
                  value={customMessage.title || ""}
                  onChange={(e) => onCustomMessageChange({ ...customMessage, title: e.target.value })}
                  placeholder="e.g., Special Offer for You!"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            )}

            {/* Message body */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Message
              </label>
              <textarea
                value={customMessage.body || ""}
                onChange={(e) => onCustomMessageChange({ ...customMessage, body: e.target.value })}
                placeholder="Write your message here..."
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                  isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              {channel === "sms" && (
                <div className={`mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {(customMessage.body || "").length} characters
                </div>
              )}
            </div>

            {/* Variable helpers */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Click to insert variable placeholders
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {VARIABLE_PLACEHOLDERS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => handleInsertVariable(v.key)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      isDarkMode ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                    }`}
                    title={v.description}
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {(customMessage.title || customMessage.body) && (
              <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Preview</h4>
                {customMessage.title && channel === "push" && (
                  <p className={`font-medium mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {customMessage.title.replace("[customer_name]", "John").replace("[store_name]", "Your Store")}
                  </p>
                )}
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {(customMessage.body || "")
                    .replace("[customer_name]", "John")
                    .replace("[customer_email]", "john@example.com")
                    .replace("[store_name]", "Your Store")
                    .replace("[store_link]", "https://yourstore.samparka.co/loyality")}
                </p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
