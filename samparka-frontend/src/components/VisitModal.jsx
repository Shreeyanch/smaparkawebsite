import React, { useEffect, useState } from "react";
import { Copy, ExternalLink, Trash, StoreIcon, X, MapPin, Phone, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import api from "../api/config";

const VisitModal = ({ isOpen, visitStore, onClose }) => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;
  const [isVisible, setIsVisible] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOutlet, setDeletingOutlet] = useState(null);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [editLocation, setEditLocation] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMapLink, setEditMapLink] = useState("");
  const [editCoords, setEditCoords] = useState(null);
  const [editCoordsLoading, setEditCoordsLoading] = useState(false);
  const [expandedOutletId, setExpandedOutletId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleEditClick = (outlet) => {
    setEditingOutlet(outlet);
    setEditLocation(outlet.location);
    setEditPhone(outlet.phone || "");
    setEditMapLink(outlet.mapLink || "");
    setEditCoords(outlet.lat != null ? { lat: outlet.lat, lng: outlet.lng } : null);
    setShowEditModal(true);
  };

  const handleEditMapLinkChange = async (e) => {
    const value = e.target.value;
    setEditMapLink(value);
    setEditCoords(null);
    if (!value.trim()) return;
    setEditCoordsLoading(true);
    try {
      const res = await api.get(`/store/resolveMapLink?url=${encodeURIComponent(value)}`, {
        headers: { token },
      });
      if (res.data.success) {
        setEditCoords({ lat: res.data.lat, lng: res.data.lng });
      }
    } catch {
      // silent
    } finally {
      setEditCoordsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await api.put(
        `/store/editOutlet/${editingOutlet._id}`,
        {
          location: editLocation,
          phone: editPhone,
          mapLink: editMapLink || undefined,
          ...(editCoords && { lat: editCoords.lat, lng: editCoords.lng }),
        },
        {
          headers: {
            token: token,
          }
        }
      );

      if (response.data.success) {
        // Update the outlet in the visitStore
        visitStore.outlets = visitStore.outlets.map((o) =>
          o._id === editingOutlet._id ? { ...o, location: editLocation, phone: editPhone, mapLink: editMapLink } : o
        );
        toast.success("Outlet updated successfully", {
          duration: 2000,
        });
        setShowEditModal(false);
        setEditingOutlet(null);
        setEditLocation("");
        setEditPhone("");
        setEditMapLink("");
      } else {
        toast.error(response.data.message || "Failed to update outlet", {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error updating outlet:", error);
      toast.error(error.response?.data?.message || "Failed to update outlet", {
        duration: 2000,
      });
    }
  };

  const handleDeleteClick = (outlet) => {
    setDeletingOutlet(outlet);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await api.delete(
        `/store/deleteOutlet/${deletingOutlet._id}`,
        {
          headers: {
            token: token,
          }
        }
      );

      if (response.data.success) {
        // Remove the outlet from visitStore
        visitStore.outlets = visitStore.outlets.filter(
          (o) => o._id !== deletingOutlet._id
        );
        toast.success("Outlet deleted successfully", {
          duration: 2000,
        });
        setShowDeleteModal(false);
        setDeletingOutlet(null);
      } else {
        toast.error(response.data.message || "Failed to delete outlet", {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error deleting outlet:", error);
      toast.error(error.response?.data?.message || "Failed to delete outlet", {
        duration: 2000,
      });
    }
  };

  if (!isOpen || !visitStore) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-out flex items-center justify-center md:justify-end z-50 p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } ${isVisible ? "scale-100 md:scale-100 opacity-100 translate-x-0" : "scale-95 md:scale-100 opacity-0 md:opacity-100 translate-x-0 md:translate-x-full"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed */}
        <div
          className={`flex items-center justify-between p-4 md:p-6 border-b sticky top-0 z-10 rounded-t-2xl md:rounded-t-lg ${
            isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2
            className={`flex gap-2 items-center text-lg md:text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <StoreIcon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="truncate">Visit Subadmin - {visitStore?.name}</span>
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

        {/* Modal Content - Scrollable */}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div
              className={`border rounded-lg p-3 md:p-4 ${
                isDarkMode
                  ? "bg-blue-900/20 border-blue-700"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  isDarkMode ? "text-blue-300" : "text-blue-800"
                }`}
              >
                <StoreIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium text-sm md:text-base">Choose Outlet to Visit</span>
              </div>
              <p
                className={`text-xs md:text-sm mt-1 ${
                  isDarkMode ? "text-blue-200" : "text-blue-600"
                }`}
              >
                Select an outlet location to visit {visitStore?.name}. You can copy the link, edit, or delete outlets.
              </p>
            </div>
            {/* Outlets List - Accordion */}
            {visitStore?.services?.multipleOutlets &&
            visitStore?.outlets?.length > 0 ? (
              <div className="space-y-3">
                {visitStore.outlets.map((outlet) => (
                  <div
                    key={outlet._id}
                    className={`border rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {/* Accordion Header - Always Visible */}
                    <button
                      onClick={() => setExpandedOutletId(expandedOutletId === outlet._id ? null : outlet._id)}
                      className={`w-full p-3 md:p-4 flex items-start justify-between hover:bg-opacity-80 transition-colors ${
                        expandedOutletId === outlet._id 
                          ? isDarkMode ? 'bg-gray-600/30' : 'bg-gray-100'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 md:gap-3 flex-1 text-left min-w-0">
                        <MapPin
                          className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold text-sm md:text-base ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {outlet.location}
                          </p>
                          
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const baseUrl = import.meta.env.VITE_CLIENT_BASE_URL.replace(/^https?:\/\//, '');
                            const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
                            navigator.clipboard.writeText(
                              `${protocol}://${visitStore.url}.${baseUrl}/store/login?outlet=${outlet._id}`
                            );
                            toast.success("Link copied to clipboard", {
                              duration: 2000,
                            });
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-xs border ${
                            isDarkMode
                              ? "border-gray-600 text-gray-300 hover:bg-gray-600"
                              : "border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                          title="Copy link"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const baseUrl = import.meta.env.VITE_CLIENT_BASE_URL.replace(/^https?:\/\//, '');
                            const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
                            const url = `${protocol}://${visitStore.url}.${baseUrl}/store/login?outlet=${outlet._id}`;
                            window.open(url, "_blank");
                            onClose();
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </button>
                        {expandedOutletId === outlet._id ? (
                          <ChevronUp
                            className={`h-5 w-5 flex-shrink-0 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                        ) : (
                          <ChevronDown
                            className={`h-5 w-5 flex-shrink-0 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    {/* Accordion Content - Expanded Details */}
                    {expandedOutletId === outlet._id && (
                      <div className={`px-4 pb-4 border-t ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}>
                        <div className="space-y-3 pt-4  flex items-start justify-between">
                          {/* Map Link */}
                          {outlet.mapLink && (
                            <div className="flex items-start gap-3">
                              <ExternalLink
                                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    isDarkMode ? "text-gray-300" : "text-gray-600"
                                  }`}
                                >
                                  Map Link
                                </p>
                                <a
                                  href={outlet.mapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-sm underline hover:no-underline ${
                                    isDarkMode ? "text-blue-400" : "text-blue-600"
                                  }`}
                                >
                                  View on Maps
                                </a>
                              </div>
                            </div>
                          )}

                          {outlet.phone && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Phone
                                className={`h-3 w-3 md:h-4 md:w-4 flex-shrink-0 ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              />
                              <p
                                className={`text-xs md:text-sm ${
                                  isDarkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                {outlet.phone}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(outlet);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm border ${
                              isDarkMode
                                ? "border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            }`}
                            title="Edit outlet"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(outlet);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm border ${
                              isDarkMode
                                ? "border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            }`}
                            title="Delete outlet"
                          >
                            <Trash className="h-3.5 w-3.5" />
                            Delete
                          </button>
                         
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`border rounded-lg p-6 text-center ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <StoreIcon
                  className={`h-12 w-12 mx-auto mb-3 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-sm mb-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  No outlets available. Visit the main store.
                </p>
                <button
                  onClick={() => {
                    const baseUrl = import.meta.env.VITE_CLIENT_BASE_URL.replace(/^https?:\/\//, '');
                    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
                    const url = `${protocol}://${visitStore.url}.${baseUrl}/store/points`;
                    window.open(url, "_blank");
                    onClose();
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Visit Outlet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-end gap-3 p-4 md:p-6 border-t rounded-b-2xl md:rounded-b-lg ${
            isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <button
            onClick={handleClose}
            className={`px-4 py-2 border rounded-md transition-colors ${
              isDarkMode
                ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:text-white"
                : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit Outlet Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingOutlet(null);
              setEditLocation("");
              setEditPhone("");
              setEditMapLink("");
            }
          }}
        >
          <div
            className={`rounded-lg w-full max-w-md ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit Modal Header */}
            <div
              className={`flex items-center justify-between p-6 border-b rounded-t-lg ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3
                className={`flex gap-2 items-center text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Edit className="w-5 h-5" />
                Edit Outlet
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOutlet(null);
                  setEditLocation("");
                  setEditPhone("");
                  setEditMapLink("");
                }}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Edit Modal Content */}
            <div className="p-6 space-y-4">
              {/* Location field - Required */}
              <div>
                <label
                  className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <MapPin className="h-5" />
                  Location *
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter outlet location"
                  required
                />
              </div>

              {/* Phone field - Required */}
              <div>
                <label
                  className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Phone className="h-5" />
                  Phone *
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Map Link field - Optional */}
              <div>
                <label
                  className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <ExternalLink className="h-5" />
                  Map Link (Optional)
                </label>
                <input
                  type="url"
                  value={editMapLink}
                  onChange={handleEditMapLinkChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                />
                {editCoordsLoading && (
                  <p className="text-xs mt-1 text-blue-500">Resolving coordinates...</p>
                )}
                {editCoords && !editCoordsLoading && (
                  <p className="text-xs mt-1 text-green-600">
                    ✓ Coordinates found: {editCoords.lat.toFixed(5)}, {editCoords.lng.toFixed(5)}
                  </p>
                )}
                {editMapLink && !editCoords && !editCoordsLoading && (
                  <p className="text-xs mt-1 text-amber-500">
                    ⚠ Could not extract coordinates — outlet won't appear on map
                  </p>
                )}
              </div>
            </div>

            {/* Edit Modal Footer */}
            <div
              className={`flex items-center justify-end gap-3 p-6 border-t rounded-b-lg ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOutlet(null);
                  setEditLocation("");
                  setEditPhone("");
                  setEditMapLink("");
                }}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:text-white"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editLocation || !editPhone}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setDeletingOutlet(null);
            }
          }}
        >
          <div
            className={`rounded-lg w-full max-w-md ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Delete Modal Header */}
            <div
              className={`flex items-center justify-between p-6 border-b rounded-t-lg ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3
                className={`flex gap-2 items-center text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Trash className="w-5 h-5 text-red-600" />
                Delete Outlet
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingOutlet(null);
                }}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Delete Modal Content */}
            <div className="p-6">
              <div
                className={`border rounded-lg p-4 ${
                  isDarkMode
                    ? "bg-red-900/20 border-red-700"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-red-200" : "text-red-800"
                  }`}
                >
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{deletingOutlet?.location}</span>?
                </p>
                <p
                  className={`text-sm mt-2 ${
                    isDarkMode ? "text-red-300" : "text-red-700"
                  }`}
                >
                  This action cannot be undone. All data associated with this outlet will be permanently removed.
                </p>
              </div>
            </div>

            {/* Delete Modal Footer */}
            <div
              className={`flex items-center justify-end gap-3 p-6 border-t rounded-b-lg ${
                isDarkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingOutlet(null);
                }}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:text-white"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Outlet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitModal;
