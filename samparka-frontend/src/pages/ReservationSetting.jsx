import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/config";
import {
  X,
  Settings,
  Upload,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ReservationSetting = ({ store, isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [images, setImages] = useState([]);
  // const [services, setServices] = useState([{ name: "" }]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [needTimeSlots, setNeedTimeSlots] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [services, setServices] = useState([]);

  const navigate = useNavigate();
  const storeId = store?._id;
  const { authState } = useAuth();
  const { token } = authState;

  const queryClient = useQueryClient();
  const [timeSlots, setTimeSlots] = useState([
    {
      outlet: store?.outlets?.[0]?.location || "",
      time: "12:00",
      numberOfSlots: "1",
    },
  ]);

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOutletChange = (index, outlet) => {
    const updated = [...timeSlots];
    updated[index].outlet = outlet;
    setTimeSlots(updated);
  };

  const handleTimeSlotChange = (index, time) => {
    const updated = [...timeSlots];
    updated[index].time = time;
    setTimeSlots(updated);
  };

  const handleNumberOfSlotChange = (index, number) => {
    const updated = [...timeSlots];
    updated[index].numberOfSlots = number;
    setTimeSlots(updated);
  };

  // const addTimeSlot = () => {
  //   setTimeSlots([
  //     ...timeSlots,
  //     {
  //       outlet: store?.outlets?.[0]?.location || "",
  //       time: "12:00",
  //       numberOfSlots: "1",
  //     },
  //   ]);
  // };

  const removeTimeSlot = (index) => {
    const updated = [...timeSlots];
    updated.splice(index, 1);
    setTimeSlots(updated);
  };

  // Fetch existing data
  const { data: existingData } = useQuery({
    queryKey: ["reservationServices", storeId],
    queryFn: async () => {
      const res = await api.get(
        `/store/reservationService/${storeId}`,
        { headers: { token } }
      );
      return res.data;
    },
    enabled: isOpen && !!storeId,
    retry: false,
  });

  useEffect(() => {
    // existingData.data contains the services array from getServices
    if (existingData?.data) setServices(existingData.data);

    if (existingData?.autoConfirmation) {
      setAutoConfirm(true);
    }
    if (existingData?.needTimeSlots) {
      setNeedTimeSlots(true);
      const formattedSlots = (existingData.timeSlots || []).map((t) =>
        typeof t === "string" ? { time: t } : t
      );
      setTimeSlots(
        formattedSlots.length > 0
          ? formattedSlots
          : [{ time: "12:00", numberOfSlots: "1" }]
      );
    }

    if (existingData?.images?.length > 0) {
      setExistingImageUrls(existingData.images); // backend URLs
      setPreviews(existingData.images); // For display
    }
  }, [existingData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const removedPreview = previews[index];
    console.log("Removing:", removedPreview);

    // If it's from backend, remove from existingImageUrls
    if (existingImageUrls.includes(removedPreview)) {
      setExistingImageUrls((prev) =>
        prev.filter((url) => url !== removedPreview)
      );
      setRemovedImages((prev) => [...prev, removedPreview]);
    } else {
      // If it's a new file, remove corresponding file too
      const fileIndex =
        previews
          .slice(0, index + 1)
          .filter((p) => !existingImageUrls.includes(p)).length - 1;

      setNewImages((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    // Remove from preview array
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Services control
  const handleServiceChange = (index, value) => {
    const updated = [...services];
    updated[index].name = value;
    setServices(updated);
  };

  const addService = () => setServices([...services, { name: "" }]);

  const removeService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    console.log("remove button clicked");
  };

  // Submit form
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post(`/store/reservation-settings`, formData, {
        headers: { "Content-Type": "multipart/form-data", token },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reservationServices", storeId]);
      toast.success("Reservation Settings Saved Successfully!");
      handleClose();
    },
    onError: (error) => {
      toast.error("Failed to save settings: " + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      previews.length === 0 ||
      services.length === 0 ||
      services.some((s) => s.name.trim() === "") ||
      (needTimeSlots && timeSlots.some((slot) => slot.time.trim() === ""))
    ) {
      toast.error("Please fill all fields properly.");
      return;
    }

    const formData = new FormData();
    formData.append("store", storeId);
    formData.append("services", JSON.stringify(services));
    formData.append("existingImageUrls", JSON.stringify(existingImageUrls));
    formData.append("removedImages", JSON.stringify(removedImages));

    if (autoConfirm) {
      formData.append("autoConfirmation", true);
    }

    if (needTimeSlots) {
      formData.append("needTimeSlots", true);
      formData.append("timeSlots", JSON.stringify(timeSlots));
    }

    newImages.forEach((img) => formData.append("images", img)); // Upload new

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  const [expandedService, setExpandedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    images: [], // Preview URLs (both existing and new)
    imageFiles: [], // Store actual File objects for new uploads
    existingImages: [], // URLs of existing images (for edit)
    deletedImages: [], // URLs of images to delete (for edit)
    autoConfirmation: false,
    needTimeSlots: false,
    timeSlots: [],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      outlet: "",
      images: [],
      imageFiles: [],
      existingImages: [],
      deletedImages: [],
      autoConfirmation: false,
      needTimeSlots: false,
      timeSlots: [],
    });
    setEditingService(null);
  };

  // Auto-select store name as outlet when multipleOutlets service is disabled
  useEffect(() => {
    if (showServiceModal && !store?.services?.multipleOutlets) {
      setFormData(prev => ({
        ...prev,
        outlet: store?.name || "Main Location"
      }));
    }
  }, [showServiceModal, store]);

  const handleAddService = () => {
    resetForm();
    setShowServiceModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service._id);
    setFormData({
      ...service,
      outlet: service.outlet || "",
      images: service.images || [], // Preview URLs from backend
      imageFiles: [], // No new files yet
      existingImages: service.images || [], // Track existing images
      deletedImages: [], // No deletions yet
      timeSlots: (service.timeSlots || []).map((slot, idx) => ({
        ...slot,
        id: slot.id || Date.now() + idx
      }))
    });
    setShowServiceModal(true);
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await api.delete(
          `/store/reservationService/${storeId}/${id}`,
          {
            headers: { token: token },
          }
        );
        if (response.data.success) {
          toast.success("Service deleted successfully");
          // Invalidate and refetch the query to update the list
          queryClient.invalidateQueries(["reservationServices", storeId]);
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service");
      }
    }
  };

  const handleSaveService = async () => {
    if (!formData.name || !formData.outlet) {
      toast.error("Please fill in required fields (name, outlet)");
      return;
    }

    // setSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("outlet", formData.outlet);
      console.log('Outlet being sent:', formData.outlet);
      formDataToSend.append("autoConfirmation", formData.autoConfirmation);
      formDataToSend.append("needTimeSlots", formData.needTimeSlots);

      // Add time slots as JSON string
      if (formData.needTimeSlots && formData.timeSlots.length > 0) {
        formDataToSend.append("timeSlots", JSON.stringify(formData.timeSlots));
      }

      if (editingService) {
        // For update: send existing images to keep and deleted images
        formDataToSend.append(
          "existingImages",
          JSON.stringify(formData.existingImages)
        );
        formDataToSend.append(
          "deletedImages",
          JSON.stringify(formData.deletedImages)
        );
      }

      // Add new image files (actual File objects)
      console.log('Image files to upload:', formData.imageFiles);
      console.log('Image files count:', formData.imageFiles.length);
      formData.imageFiles.forEach((file) => {
        console.log('Appending file:', file.name, file.type, file.size);
        formDataToSend.append("images", file);
      });

      const url = editingService
        ? `/store/reservationService/${storeId}/${editingService}`
        : `/store/reservationService/${storeId}`;

      // Log FormData contents
      console.log('FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      let response;
      if (editingService) {
        response = await api.put(url, formDataToSend, {
          headers: { 
            token: token,
            // Don't set Content-Type - let browser set it with boundary
          },
        });
      } else {
        response = await api.post(url, formDataToSend, {
          headers: { 
            token: token,
            // Don't set Content-Type - let browser set it with boundary
          },
        });
      }

      if (response.data.success) {
        toast.success(
          editingService
            ? "Service updated successfully"
            : "Service created successfully"
        );
        // Invalidate and refetch the query to update the list
        queryClient.invalidateQueries(["reservationServices", storeId]);
        setShowServiceModal(false);
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      // setSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    console.log('Image URLs created:', imageUrls);
    setFormData({ 
      ...formData, 
      images: [...formData.images, ...imageUrls],
      imageFiles: [...formData.imageFiles, ...files]
    });
    console.log('FormData after upload:', { 
      images: [...formData.images, ...imageUrls],
      imageFiles: [...formData.imageFiles, ...files]
    });
  };

  const removeImage = (index) => {
    const imageToRemove = formData.images[index];
    
    // Check if it's an existing image (URL) or a new one (blob URL)
    if (formData.existingImages.includes(imageToRemove)) {
      // It's an existing image, add to deletedImages
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index),
        existingImages: formData.existingImages.filter(img => img !== imageToRemove),
        deletedImages: [...formData.deletedImages, imageToRemove],
      });
    } else {
      // It's a new image, remove from both arrays
      const newImageIndex = formData.images.slice(0, index).filter(img => !formData.existingImages.includes(img)).length;
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index),
        imageFiles: formData.imageFiles.filter((_, i) => i !== newImageIndex),
      });
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [
        ...formData.timeSlots,
        { id: Date.now(), outlet: formData.outlet, time: "", numberOfSlots: 1 },
      ],
    });
  };

  const updateTimeSlot = (id, field, value) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      ),
    });
  };

  const deleteTimeSlot = (id) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((slot) => slot.id !== id),
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-end z-50 p-2 sm:p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
    >
      <div
        className={`rounded-lg w-full sm:max-w-md md:max-w-lg h-[99vh] sm:h-[98vh] overflow-hidden transform transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        } ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 z-10 rounded-t-lg ${
            isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2
            className={`flex gap-2 items-center text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Settings className="h-5 w-5" />
            Reservation Settings
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="p-4 sm:p-6 overflow-y-auto max-h-[calc(99vh-200px)] sm:max-h-[calc(98vh-220px)]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="space-y-4">
            {/* Add Service Button */}
            <button
              onClick={handleAddService}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-500"
                  : "border-gray-300 text-gray-600 hover:border-green-600 hover:text-green-600"
              }`}
            >
              <Plus size={20} />
              Add New Service
            </button>

            {/* Services List */}
            <div className="space-y-3">
              {services?.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service._id}
                    className={`rounded-lg border overflow-hidden ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {/* Service Header */}
                    <div
                      onClick={() =>
                        setExpandedService(
                          expandedService === service._id ? null : service._id
                        )
                      }
                      className="flex items-center gap-4 p-4 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {service.images[0] && (
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {service.name}
                        </h3>
                        {service.price && (
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            रू {service.price}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditService(service);
                          }}
                          className={`p-2 rounded hover:bg-opacity-10 ${
                            isDarkMode ? "hover:bg-white" : "hover:bg-black"
                          }`}
                        >
                          <Edit2
                            size={18}
                            className={
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteService(service._id);
                          }}
                          className={`p-2 rounded hover:bg-opacity-10 ${
                            isDarkMode ? "hover:bg-white" : "hover:bg-black"
                          }`}
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                        {expandedService === service._id ? (
                          <ChevronUp
                            size={20}
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }
                          />
                        ) : (
                          <ChevronDown
                            size={20}
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedService === service._id && (
                      <div
                        className={`px-4 pb-4 space-y-3 border-t ${
                          isDarkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <div className="pt-3">
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {service.description}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {service.autoConfirmation && (
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                              Auto Confirmation
                            </span>
                          )}
                          {service.needTimeSlots && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                              Time Slots Required
                            </span>
                          )}
                        </div>

                        {service.needTimeSlots &&
                          service.timeSlots.length > 0 && (
                            <div className="space-y-2">
                              <h4
                                className={`text-sm font-semibold ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                Time Slots
                              </h4>
                              {service.timeSlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className={`flex items-center justify-between p-2 rounded text-sm ${
                                    isDarkMode ? "bg-gray-600" : "bg-white"
                                  }`}
                                >
                                  <span
                                    className={
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-700"
                                    }
                                  >
                                    {slot.outlet} - {slot.time} (
                                    {slot.numberOfSlots} slots)
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p
                  className={`text-center py-6 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No services added yet.
                </p>
              )}
            </div>

            {/* Service Modal */}
            {showServiceModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div
                  className={`rounded-lg w-full max-w-2xl h-[99vh] sm:h-[98vh] overflow-y-auto ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  {/* Modal Header */}
                  <div
                    className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {editingService ? "Edit Service" : "Add New Service"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowServiceModal(false);
                        resetForm();
                      }}
                      className={
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-400 hover:text-gray-600"
                      }
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 space-y-4">
                    {/* Outlet Selection */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Select Outlet *
                      </label>
                      <select
                        value={formData.outlet || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, outlet: e.target.value })
                        }
                        disabled={!store?.services?.multipleOutlets}
                        className={`w-full px-3 py-2 rounded border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } ${!store?.services?.multipleOutlets ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {!store?.services?.multipleOutlets ? (
                          <option value={store?.name || "Main Location"}>
                            {store?.name || "Main Location"}
                          </option>
                        ) : store?.outlets && store.outlets.length <= 1 ? (
                          <>
                            <option value="">Select Outlet</option>
                            <option value={store?.name || "Main Location"}>
                              {store?.name || "Main Location"}
                            </option>
                            {store?.outlets?.map((outlet) => (
                              <option key={outlet._id} value={outlet.location}>
                                {outlet.location}
                              </option>
                            ))}
                          </>
                        ) : (
                          <>
                            <option value="">Select Outlet</option>
                            <option value="All Outlets">All Outlets</option>
                            {store?.outlets?.map((outlet) => (
                              <option key={outlet._id} value={outlet.location}>
                                {outlet.location}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Name */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Service Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        placeholder="Enter service name"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className={`w-full px-3 py-2 rounded border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        placeholder="Enter service description"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Price (रू)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        placeholder="0.00"
                      />
                    </div>

                    {/* Images */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Images
                      </label>
                      <div className="space-y-2">
                        <label
                          className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded cursor-pointer ${
                            isDarkMode
                              ? "border-gray-600 text-gray-400 hover:border-gray-500"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          <Upload size={18} />
                          Upload Images
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {formData.images.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt=""
                                  className="w-full h-20 object-cover rounded"
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.autoConfirmation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              autoConfirmation: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Auto Confirmation
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.needTimeSlots}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              needTimeSlots: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Need Time Slots
                        </span>
                      </label>
                    </div>

                    {/* Time Slots */}
                    {formData.needTimeSlots && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Time Slots
                          </label>
                          <button
                            onClick={addTimeSlot}
                            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                          >
                            <Plus size={16} />
                            Add Slot
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.timeSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`flex gap-2 p-2 rounded ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              <div className={`flex-1 px-2 py-1 rounded text-sm flex items-center ${
                                isDarkMode
                                  ? "bg-gray-600 text-white"
                                  : "bg-white text-gray-900"
                              }`}>
                                {slot.outlet || formData.outlet || "No outlet selected"}
                              </div>
                              <input
                                type="time"
                                value={slot.time}
                                onChange={(e) =>
                                  updateTimeSlot(
                                    slot.id,
                                    "time",
                                    e.target.value
                                  )
                                }
                                className={`flex-1 px-2 py-1 rounded text-sm ${
                                  isDarkMode
                                    ? "bg-gray-600 text-white"
                                    : "bg-white text-gray-900"
                                }`}
                              />
                              <input
                                type="number"
                                placeholder="Slots"
                                value={slot.numberOfSlots}
                                onChange={(e) =>
                                  updateTimeSlot(
                                    slot.id,
                                    "numberOfSlots",
                                    e.target.value
                                  )
                                }
                                className={`w-20 px-2 py-1 rounded text-sm ${
                                  isDarkMode
                                    ? "bg-gray-600 text-white"
                                    : "bg-white text-gray-900"
                                }`}
                              />
                              <button
                                onClick={() => deleteTimeSlot(slot.id)}
                                className="p-1 text-red-500 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div
                    className={`flex items-center justify-end gap-3 p-4 border-t sticky bottom-0 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setShowServiceModal(false);
                        resetForm();
                      }}
                      className={`px-4 py-2 text-sm border rounded ${
                        isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveService}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {editingService ? "Update Service" : "Add Service"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer - Fixed at bottom */}
        <div
          className={`flex items-center justify-end gap-3 p-4 sm:p-6 border-t sticky bottom-0 ${
            isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* <button
            onClick={handleClose}
            className={`px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ReservationSetting;
