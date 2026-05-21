import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import { ChatDrawer, ChatModal } from "../components/WhatsAppChat"; // Adjust path as needed
import api from "../api/config";
import {
  Send,
  Plus,
  Upload,
  FileText,
  X,
  User,
  Phone,
  Building2,
  Image,
  CheckCheck,
  Clock,
  MessageCircle,
} from "lucide-react";

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// WhatsApp Message Preview Component
const WhatsAppPreview = ({ template, headerParams, bodyParams, mediaUrl }) => {
  const replaceVariables = (text, params) => {
    if (!text) return "";
    let result = text;
    params.forEach((param, index) => {
      result = result.replace(`{{${index + 1}}}`, param || `{{${index + 1}}}`);
    });
    return result;
  };

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-[#e5ddd5] dark:bg-gray-900 rounded-lg p-4 h-[600px] flex flex-col">
      <div className="bg-[#075e54] dark:bg-gray-800 text-white px-4 py-3 rounded-t-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <User size={24} className="text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold">Customer</h3>
          <p className="text-xs text-gray-200">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex justify-start">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-xs">
            {mediaUrl && (
              <img
                src={mediaUrl}
                alt="Header"
                className="rounded-t-lg w-full h-48 object-cover"
              />
            )}
            <div className="p-3">
              {template?.header && (
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {replaceVariables(template.header, headerParams)}
                </p>
              )}
              {template?.body && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 whitespace-pre-wrap">
                  {replaceVariables(template.body, bodyParams)}
                </p>
              )}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs text-gray-500">{currentTime}</span>
                <CheckCheck size={16} className="text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WhatsApp = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const { authState } = useAuth();
  const { token } = authState;
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState("single");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadImageForm, setUploadImageForm] = useState({
    storeId: "",
    image: null, // for preview
    imageFile: null, // for upload
  });
  const [createWhatsappAccountForm, setCreateWhatsAppAccountForm] = useState({
    storeId: "",
    phoneNumberId: "",
    accessToken: "",
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    hasImage: false,
    hasHeader: false,
    header: "",
    body: "",
    headerVariables: [],
    bodyVariables: [],
    footer: "",
    buttons: [],
  });

  // Mock data - replace with actual API calls
  const [templates, setTemplates] = useState([
    {
      _id: "1",
      name: "business_intro",
      header: "Hello {{1}}",
      body: "Your bill is {{1}}",
    },
  ]);

  // Form states
  const [singleForm, setSingleForm] = useState({
    to: "",
    templateId: "",
    headerParams: [],
    bodyParams: [],
    mediaId: "",
  });

  const [bulkForm, setBulkForm] = useState({
    recipients: [
      {
        phone: "",
        headerParams: [],
        bodyParams: [],
      },
    ],
    templateId: "",
    mediaId: "",
  });

  // Preview state
  const [previewTemplate, setPreviewTemplate] = useState({
    header: "Hello {{user}}",
    body: "Your bill amount is NPR.{{bill_amount}}. Thank you for your business!",
  });

  const [previewParams, setPreviewParams] = useState({
    header: [],
    body: [],
  });

  // fetching templates from API
  const fetchTemplates = async () => {
    const response = await api.get(
      "/api/whatsapp/templates/6798b5994dfc04de9e55a3c1"
    );
    setTemplates(response.data);
  };
  const fetchStores = async () => {
    const response = await api.get("/store", { headers: { token } });
    if (response.data.success) {
      setStores(response.data.stores);
    }
  };
  const fetchImages = async () => {
    try {
      const response = await api.get(
        "/api/whatsapp/media/6798b5994dfc04de9e55a3c1"
      );
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchTemplates();
    fetchImages();
  }, [token]);

  const addBulkRecipient = () => {
    setBulkForm({
      ...bulkForm,
      recipients: [
        ...bulkForm.recipients,
        { phone: "", headerParams: [], bodyParams: [] },
      ],
    });
  };

  const removeBulkRecipient = (index) => {
    const newRecipients = bulkForm.recipients.filter((_, i) => i !== index);
    setBulkForm({ ...bulkForm, recipients: newRecipients });
  };

  const updateBulkRecipient = (index, field, value) => {
    const newRecipients = [...bulkForm.recipients];
    newRecipients[index][field] = value;
    setBulkForm({ ...bulkForm, recipients: newRecipients });
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/whatsapp/send-message", {
        storeId: "6798b5994dfc04de9e55a3c1",
        to: singleForm.to,
        templateId: singleForm.templateId,
        headerParams: singleForm.headerParams,
        bodyParams: singleForm.bodyParams,
        mediaId: singleForm.mediaId,
      });
      if (response.data.success) {
        toast.success("Message sent successfully!");
        setSingleForm({
          to: "",
          templateId: "",
          headerParams: [],
          bodyParams: [],
          mediaId: "",
        });
        previewTemplate({
          header: "Hello {{user}}",
          body: "Your bill amount is NPR.{{bill_amount}}. Thank you for your business!",
        });
        setPreviewParams({ header: [], body: [] });
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      toast.error("An error occurred while sending the message.");
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    // Add API call here
    try {
      const response = await api.post("/api/whatsapp/bulk-send", {
        storeId: "6798b5994dfc04de9e55a3c1",
        templateId: bulkForm.templateId,
        mediaId: bulkForm.mediaId,
        recipients: bulkForm.recipients,
      });
      if (response.data.success) {
        toast.success("Message sent successfully!");
        setBulkForm({
          recipients: [{ phone: "", headerParams: [], bodyParams: [] }],
          templateId: "",
          mediaId: "",
        });
        previewTemplate({
          header: "Hello {{user}}",
          body: "Your bill amount is NPR.{{bill_amount}}. Thank you for your business!",
        });
        setPreviewParams({ header: [], body: [] });
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      toast.error("An error occurred while sending the message.");
    }
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/whatsapp/create-template", {
        storeId: "6798b5994dfc04de9e55a3c1",
        ...templateForm,
      });
      if (response.data.success) {
        toast.success("Template created successfully!");
        setShowTemplateModal(false);
        setTemplateForm({
          name: "",
          hasImage: false,
          hasHeader: false,
          header: "",
          body: "",
          headerVariables: [],
          bodyVariables: [],
          footer: "",
          buttons: [],
        });
        // Refresh templates
        fetchTemplates();
      } else {
        toast.error("Failed to create template.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the template.");
    }
  };

  const handleCreateWhatsAppAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/whatsapp/create-account", {
        ...createWhatsappAccountForm,
      });
      if (response.data.success) {
        toast.success("WhatsApp account created successfully!");
        setShowAccountModal(false);
        setCreateWhatsAppAccountForm({
          storeId: "",
          phoneNumberId: "",
          accessToken: "",
        });
      } else {
        toast.error("Failed to create WhatsApp account.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the WhatsApp account.");
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!uploadImageForm.imageFile) {
      toast.error("Please select an image first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("storeId", uploadImageForm.storeId);
      formData.append("image", uploadImageForm.imageFile); // This should now be a File object

      const response = await api.post("/api/whatsapp/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Image uploaded successfully!");
        setShowImageModal(false);
        setUploadImageForm({
          storeId: "",
          image: null,
          imageFile: null,
        });
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while uploading the image.");
    }
  };

  const handleChatSelect = (phone) => {
    setSelectedPhone(phone);
    setShowChatModal(true);
    // setShowChatDrawer(false); // Close drawer on mobile when opening chat
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setSelectedPhone(null);
  };

  return (
    <div className="px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            WhatsApp Business Messaging
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send personalized messages to your customers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
          >
            <Plus size={20} />
            New WA Account
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
          >
            <FileText size={20} />
            Create Template
          </button>
          <button
            onClick={() => setShowImageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md"
          >
            <Upload size={20} />
            Upload Image
          </button>
          <button
            onClick={() => setShowChatDrawer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md"
          >
            <MessageCircle size={20} />
            View Chats
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab("single")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "single"
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Single Message
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "bulk"
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Bulk Messages
              </button>
              <button
                onClick={() => setActiveTab("images")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "images"
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Images
              </button>
            </div>
          </div>
        </div>

        {activeTab === "images" ? (
          //Image Gallery
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Uploaded Images
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {images.length} {images.length === 1 ? "image" : "images"}
                </span>
              </div>

              {images.length === 0 ? (
                <div className="text-center py-12">
                  <Image
                    size={64}
                    className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No images uploaded yet.
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    Upload your first image to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {images.map((img) => (
                    <div
                      key={img._id}
                      className="group bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={img.imageUrl}
                          alt="Uploaded media"
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Media ID
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(img.mediaId);
                              toast.success("Media ID copied!");
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            title="Copy Media ID"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1 truncate">
                          {img.mediaId}
                        </p>
                        {img.createdAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {new Date(img.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {activeTab === "single" ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Send Single Message
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="9779800000000"
                      value={singleForm.to}
                      onChange={(e) =>
                        setSingleForm({ ...singleForm, to: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template
                    </label>
                    <select
                      value={singleForm.templateId}
                      onChange={(e) => (
                        setSingleForm({
                          ...singleForm,
                          templateId: e.target.value,
                        }),
                        setPreviewTemplate(
                          templates.filter((t) => t._id === e.target.value)[0]
                        )
                      )}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="" disabled>
                        Select Template
                      </option>
                      {templates.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {singleForm.templateId && (
                    <>
                      {templates.filter(
                        (t) => t._id === singleForm.templateId
                      )[0].hasHeader
                        ? templates.filter(
                            (t) => t._id === singleForm.templateId
                          )[0].headerVariables.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Header Parameters
                              </label>
                              <input
                                type="text"
                                placeholder="Business Name"
                                value={singleForm.headerParams.join(",")}
                                onChange={(e) => {
                                  const params = e.target.value
                                    .split(",")
                                    .map((p) => p.trim());
                                  setSingleForm({
                                    ...singleForm,
                                    headerParams: params,
                                  });
                                  setPreviewParams({
                                    ...previewParams,
                                    header: params,
                                  });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          )
                        : templates.filter(
                            (t) => t._id === singleForm.templateId
                          )[0].hasImage && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Media ID
                              </label>
                              <input
                                type="text"
                                placeholder="1234567890000000"
                                value={singleForm.mediaId}
                                onChange={(e) =>
                                  setSingleForm({
                                    ...singleForm,
                                    mediaId: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          )}

                      {templates.filter(
                        (t) => t._id === singleForm.templateId
                      )[0].bodyVariables.length > 0 &&
                        templates
                          .filter((t) => t._id === singleForm.templateId)[0]
                          .bodyVariables.map((params, index) => (
                            <div key={index}>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Body Parameters
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder={params}
                                  disabled
                                  className="w-full cursor-not-allowed px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                  type="text"
                                  value={singleForm.bodyParams.join(",")}
                                  onChange={(e) => {
                                    const params = e.target.value
                                      .split(",")
                                      .map((p) => p.trim());
                                    setSingleForm({
                                      ...singleForm,
                                      bodyParams: params,
                                    });
                                    setPreviewParams({
                                      ...previewParams,
                                      body: params,
                                    });
                                  }}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </div>
                          ))}

                      <button
                        onClick={handleSingleSubmit}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md font-medium"
                      >
                        <Send size={20} />
                        Send Message
                      </button>
                    </>
                  )}
                </div>
              ) : (
                activeTab === "bulk" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Send Bulk Messages
                      </h2>
                      {bulkForm.templateId && (
                        <button
                          onClick={addBulkRecipient}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Plus size={16} />
                          Add Recipient
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template
                      </label>
                      <select
                        value={bulkForm.templateId}
                        onChange={(e) => (
                          setBulkForm({
                            ...bulkForm,
                            templateId: e.target.value,
                          }),
                          setPreviewTemplate(
                            templates.filter((t) => t._id === e.target.value)[0]
                          )
                        )}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="" disabled>
                          Select Template
                        </option>
                        {templates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {bulkForm.templateId && (
                      <>
                        {templates.filter(
                          (t) => t._id === bulkForm.templateId
                        )[0].hasImage && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Media ID
                            </label>
                            <input
                              type="text"
                              placeholder="1234567890000000"
                              value={bulkForm.mediaId}
                              onChange={(e) =>
                                setBulkForm({
                                  ...bulkForm,
                                  mediaId: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        )}

                        <div>
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {(() => {
                              const selectedTemplate = templates.find(
                                (t) => t._id === bulkForm.templateId
                              );

                              const hasHeader =
                                selectedTemplate?.headerVariables?.length > 0;
                              const hasBody =
                                selectedTemplate?.bodyVariables?.length > 0;

                              // CASE 1: NO VARIABLES => show one textarea to paste phone list
                              if (!hasHeader && !hasBody) {
                                return (
                                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                      Bulk Phone Numbers
                                    </h3>

                                    <textarea
                                      rows={6}
                                      placeholder="Paste phone numbers separated by comma or newline:&#10;9779812312311&#10;9779813215178&#10;9779860648501"
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                      onChange={(e) => {
                                        const numbers = e.target.value
                                          .split(/[\n,]/)
                                          .map((n) => n.trim())
                                          .filter((n) => n);
                                        setBulkForm((prev) => ({
                                          ...prev,
                                          recipients: numbers.map((num) => ({
                                            phone: num,
                                            headerParams: [],
                                            bodyParams: [],
                                          })),
                                        }));
                                      }}
                                    />
                                  </div>
                                );
                              }

                              // CASE 2: TEMPLATE HAS VARIABLES → show dynamic recipient card per number
                              return bulkForm.recipients.map(
                                (recipient, index) => (
                                  <div
                                    key={index}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative"
                                  >
                                    {bulkForm.recipients.length > 1 && (
                                      <button
                                        onClick={() =>
                                          removeBulkRecipient(index)
                                        }
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                      >
                                        <X size={20} />
                                      </button>
                                    )}

                                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                      Recipient {index + 1}
                                    </h3>

                                    <div className="space-y-3">
                                      <input
                                        type="tel"
                                        placeholder="Phone: 9779860648501"
                                        value={recipient.phone}
                                        onChange={(e) =>
                                          updateBulkRecipient(
                                            index,
                                            "phone",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                      />

                                      {/* Header Variables Form */}
                                      {hasHeader &&
                                        selectedTemplate.headerVariables.map(
                                          (param, paramIndex) => (
                                            <input
                                              key={paramIndex}
                                              type="text"
                                              placeholder={`Header param: ${param}`}
                                              value={
                                                recipient.headerParams[
                                                  paramIndex
                                                ] || ""
                                              }
                                              onChange={(e) => {
                                                const list = [
                                                  ...recipient.headerParams,
                                                ];
                                                list[paramIndex] =
                                                  e.target.value;
                                                updateBulkRecipient(
                                                  index,
                                                  "headerParams",
                                                  list
                                                );
                                              }}
                                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                            />
                                          )
                                        )}

                                      {/* Body Variables Form */}
                                      {hasBody &&
                                        selectedTemplate.bodyVariables.map(
                                          (param, paramIndex) => (
                                            <input
                                              key={paramIndex}
                                              type="text"
                                              placeholder={`Body param: ${param}`}
                                              value={
                                                recipient.bodyParams[
                                                  paramIndex
                                                ] || ""
                                              }
                                              onChange={(e) => {
                                                const list = [
                                                  ...recipient.bodyParams,
                                                ];
                                                list[paramIndex] =
                                                  e.target.value;
                                                updateBulkRecipient(
                                                  index,
                                                  "bodyParams",
                                                  list
                                                );
                                              }}
                                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                            />
                                          )
                                        )}
                                    </div>
                                  </div>
                                )
                              );
                            })()}
                          </div>

                          <button
                            onClick={handleBulkSubmit}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md font-medium"
                          >
                            <Send size={20} />
                            Send {bulkForm.recipients.length} Messages
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Preview Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Message Preview
              </h2>
              <WhatsAppPreview
                template={previewTemplate}
                headerParams={previewParams.header}
                bodyParams={previewParams.body}
              />
            </div>
          </div>
        )}

        {/* Modals */}
        {/* create WA account */}
        <Modal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          title="Create WhatsApp Account"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store
              </label>
              <select
                name="storeId"
                id="storeId"
                onChange={(e) => {
                  setCreateWhatsAppAccountForm({
                    ...createWhatsappAccountForm,
                    storeId: e.target.value,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled selected>
                  Select Store
                </option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number ID
              </label>
              <input
                type="text"
                onChange={(e) => {
                  setCreateWhatsAppAccountForm({
                    ...createWhatsappAccountForm,
                    phoneNumberId: e.target.value,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Token
              </label>
              <textarea
                rows={3}
                onChange={(e) => {
                  setCreateWhatsAppAccountForm({
                    ...createWhatsappAccountForm,
                    accessToken: e.target.value,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={handleCreateWhatsAppAccount}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Create Account
            </button>
          </div>
        </Modal>

        {/* create template */}
        <Modal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          title="Create Message Template"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <input
                type="text"
                placeholder="business_intro"
                onChange={(e) => {
                  setTemplateForm({ ...templateForm, name: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasImage"
                className="rounded"
                checked={templateForm.hasImage}
                onChange={(e) => {
                  setTemplateForm({
                    ...templateForm,
                    hasImage: e.target.checked,
                    hasHeader: e.target.checked
                      ? false
                      : templateForm.hasHeader, // Uncheck hasHeader if hasImage is checked
                  });
                }}
              />
              <label
                htmlFor="hasImage"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Has image
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasHeader"
                className="rounded"
                checked={templateForm.hasHeader}
                onChange={(e) => {
                  setTemplateForm({
                    ...templateForm,
                    hasHeader: e.target.checked,
                    hasImage: e.target.checked ? false : templateForm.hasImage, // Uncheck hasImage if hasHeader is checked
                  });
                }}
              />
              <label
                htmlFor="hasHeader"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Has header
              </label>
            </div>
            {templateForm.hasHeader && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Header Text (use {`{{username}}`} for variables)
                </label>
                <input
                  type="text"
                  placeholder="Hello {{username}}"
                  onChange={(e) => {
                    const headerText = e.target.value;

                    // Extract variables from {{variable}} pattern
                    const variableRegex = /\{\{([^}]+)\}\}/g;
                    const matches = [...headerText.matchAll(variableRegex)];
                    const variables = matches.map((match) => match[1].trim());

                    // Remove duplicates
                    const uniqueVariables = [...new Set(variables)];

                    setTemplateForm({
                      ...templateForm,
                      header: e.target.value,
                      headerVariables: uniqueVariables,
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Text (use {`{{ user }}, {{ bill_amount }}`} for variables)
              </label>
              <textarea
                rows={4}
                value={templateForm.body}
                onChange={(e) => {
                  const bodyText = e.target.value;

                  // Extract variables from {{variable}} pattern
                  const variableRegex = /\{\{([^}]+)\}\}/g;
                  const matches = [...bodyText.matchAll(variableRegex)];
                  const variables = matches.map((match) => match[1].trim());

                  // Remove duplicates
                  const uniqueVariables = [...new Set(variables)];

                  setTemplateForm({
                    ...templateForm,
                    body: bodyText,
                    bodyVariables: uniqueVariables,
                  });
                }}
                placeholder="Your bill amount is NPR.{{bill_amount}}. Thank you!"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer
              </label>
              <input
                type="text"
                placeholder="footer"
                onChange={(e) => {
                  setTemplateForm({ ...templateForm, footer: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buttons
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateForm({
                      ...templateForm,
                      buttons: [...(templateForm.buttons || []), ""],
                    });
                  }}
                  className="m-1 p-1 px-2 text-xs text-white bg-green-800 rounded-xl"
                >
                  Add Button
                </button>
              </div>

              <div className="space-y-2">
                {(templateForm.buttons || []).map((button, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Button ${index + 1}`}
                      value={button}
                      onChange={(e) => {
                        const newButtons = [...templateForm.buttons];
                        newButtons[index] = e.target.value;
                        setTemplateForm({
                          ...templateForm,
                          buttons: newButtons,
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newButtons = templateForm.buttons.filter(
                          (_, i) => i !== index
                        );
                        setTemplateForm({
                          ...templateForm,
                          buttons: newButtons,
                        });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleTemplateSubmit}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Create Template
            </button>
          </div>
        </Modal>

        {/* upload Image */}
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title="Upload Image to WhatsApp"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store ID
              </label>
              <select
                name="storeId"
                id="storeId"
                onChange={(e) => {
                  setUploadImageForm({
                    ...uploadImageForm,
                    storeId: e.target.value,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled selected>
                  Select Store
                </option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUploadImageForm({
                        ...uploadImageForm,
                        image: reader.result, // base64 for preview
                        imageFile: file, // actual File object for upload
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label
                htmlFor="imageUpload"
                className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
              >
                {uploadImageForm.image ? (
                  <div className="relative">
                    <img
                      src={uploadImageForm.image}
                      alt="Preview"
                      className="max-h-52 mx-auto rounded-lg"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <>
                    <Image size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                  </>
                )}
              </label>
            </div>
            <button
              onClick={handleImageUpload}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Upload Image
            </button>
          </div>
        </Modal>
      </div>

      {/* Chat Drawer and Modal */}
      <ChatDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        onChatSelect={handleChatSelect}
      />
      <ChatModal
        isOpen={showChatModal}
        onClose={handleCloseChatModal}
        phone={selectedPhone}
      />
    </div>
  );
};

export default WhatsApp;
