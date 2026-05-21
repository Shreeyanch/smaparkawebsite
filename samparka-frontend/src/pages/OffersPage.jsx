import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import api from "../api/config";
import { Gift, Plus, Trash2, Pencil } from "lucide-react";
import StoreSelector from "../components/common/StoreSelector";

const OffersPage = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(localStorage.getItem("offersPageStore") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState("");
  const [addOffer, setAddOffer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Get selected store object
  const store = stores.find(s => s._id === selectedStoreId) || null;

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const endpoint = user?.role === "admin" ? "/store" : "/store/myStores";
        const response = await api.get(endpoint, { headers: { token } });
        if (response.data.success && response.data.stores?.length > 0) {
          setStores(response.data.stores);
          // Auto-select first store if none selected
          if (!selectedStoreId) {
            setSelectedStoreId(response.data.stores[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [token, user?.role]);

  // Save selected store to localStorage
  useEffect(() => {
    if (selectedStoreId) {
      localStorage.setItem("offersPageStore", selectedStoreId);
    }
  }, [selectedStoreId]);

  const handleDeleteOffer = (offer) => {
    setConfirmDelete(offer);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/store/offer/${confirmDelete._id}`, {
        headers: { token },
      });
      // queryClient.invalidateQueries(["offers", store._id]);
      fetchOffers();
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    startDate: "",
    expiryDate: "",
    display: false,
  });

  // const handleEditOffer = (offer) => {
  //   setSelectedOffer(offer);
  //   setAddOffer(true);
  //   setFormData({
  //     title: offer.title,
  //     description: offer.description,
  //     startDate: offer.startDate?.slice(0, 10),
  //     expiryDate: offer.expiryDate?.slice(0, 10),
  //   });
  // };
  useEffect(() => {
    if (selectedOffer) {
      setFormData({
        title: selectedOffer.title || "",
        description: selectedOffer.description || "",
        startDate: selectedOffer.startDate?.split("T")[0] || "",
        expiryDate: selectedOffer.expiryDate?.split("T")[0] || "",
        image: null, // keep it null until user uploads new
        display: selectedOffer.display || false,
      });
      setImagePreview(selectedOffer.image || null);
    }
  }, [selectedOffer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    try {
      if (selectedOffer) {
        await api.put(`/store/offer/${selectedOffer._id}`, data, {
          headers: { token },
        });
      } else {
        await api.post(`/store/createOffer/${store._id}`, data, {
          headers: { token },
        });
      }

      // queryClient.invalidateQueries(["offers", storeId]);
      fetchOffers();
      setAddOffer(false);
      setSelectedOffer(null);
      setFormData({
        title: "",
        description: "",
        image: null,
        startDate: "",
        expiryDate: "",
        display: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOffers = async () => {
    if (!store) return;
    setLoading(true);
    try {
      const response = await api.get(`/store/offers/store/${store._id}`, {
        headers: { token },
      });

      setOffers(response.data);
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store) {
      fetchOffers();
    }
  }, [token, store?._id]);

  if (isLoading) {
    return (
      <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>No store found</p>
      </div>
    );
  }

  return (
    <div
      className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"
      }`}
    >
      {loading && <LoadingSpinner />}

      {/* Header Section */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center lg:justify-between w-full mb-6 p-4 border-b-2 gap-4 ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f2f5f9] border-gray-200"
        }`}
      >
        {/* Left: Title and Description */}
        <div className="flex flex-col gap-1">
          <h1
            className={`text-2xl font-medium ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Offers
          </h1>
          <p
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Manage ongoing offers for your store
          </p>
        </div>

        {/* Right: Store Selector and Add Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <StoreSelector
              selectedStoreId={selectedStoreId}
              onStoreIdChange={setSelectedStoreId}
              variant="default"
              customStores={stores}
              fetchOnMount={false}
            />
          </div>

          <button
            onClick={() => setAddOffer(!addOffer)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
          >
            <Plus className="h-4 w-4" />
            Add New Offer
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="px-4">
        <div
          className={`rounded-xl shadow-lg overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-6">
            {store ? (
              <>
                {!loading && offers?.length === 0 && (
                  <div className={`text-center py-8 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <p>No ongoing offers found.</p>
                  </div>
                )}

                {!loading && offers?.length > 0 && (
                  <div className={`border rounded-lg overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <table className="w-full">
                      <thead className={isDarkMode ? "bg-gray-800" : "bg-gray-50"}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Image</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Title</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Description</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Start Date</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Expiry Date</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Status</th>
                          <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
                        </tr>
                      </thead>

                      <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                        {offers?.length > 0 ? (
                          offers
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                            )
                            .map((offer) => (
                              <tr
                                key={offer._id}
                                className={`transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-gray-800"
                                    : "hover:bg-gray-50"
                                }`}
                            >
                              {/* Image */}
                              <td className="px-4 py-3">
                                {offer.image ? (
                                  <img
                                    src={offer.image}
                                    alt={offer.title}
                                    className="w-12 h-12 object-cover rounded cursor-pointer"
                                    onClick={() => setPreviewImage(offer.image)}
                                  />
                                ) : (
                                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>-</span>
                                )}
                              </td>

                              <td className={`px-4 py-3 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {offer.title}
                              </td>
                              <td className={`px-4 py-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{offer.description}</td>
                              <td className={`px-4 py-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {offer.startDate
                                  ? format(
                                      new Date(offer.startDate),
                                      "dd MMM yyyy"
                                    )
                                  : "-"}
                              </td>
                              <td className={`px-4 py-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {offer.expiryDate
                                  ? format(
                                      new Date(offer.expiryDate),
                                      "dd MMM yyyy"
                                    )
                                  : "-"}
                              </td>
                              {/* Status */}
                              <td className="px-4 py-3">
                                {offer.isActive ? (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    isDarkMode
                                      ? "bg-green-900/30 text-green-400 border border-green-800"
                                      : "bg-green-100 text-green-700 border border-green-200"
                                  }`}>
                                    Active
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    isDarkMode
                                      ? "bg-red-900/30 text-red-400 border border-red-800"
                                      : "bg-red-100 text-red-700 border border-red-200"
                                  }`}>
                                    Inactive
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Edit */}
                                  <button
                                    onClick={() => {
                                      setSelectedOffer(offer);
                                      setAddOffer(true);
                                      setFormData({
                                        title: offer.title || "",
                                        description: offer.description || "",
                                        image: null,
                                        startDate: offer.startDate
                                          ? new Date(offer.startDate).toISOString().split("T")[0]
                                          : "",
                                        expiryDate: offer.expiryDate
                                          ? new Date(offer.expiryDate).toISOString().split("T")[0]
                                          : "",
                                        display: offer.display || false,
                                      });
                                    }}
                                    className={`p-2 rounded-full transition-colors ${
                                      isDarkMode
                                        ? "hover:bg-gray-700 text-blue-400"
                                        : "hover:bg-blue-50 text-blue-600"
                                    }`}
                                    title="Edit Offer"
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => handleDeleteOffer(offer)}
                                    className={`p-2 rounded-full transition-colors ${
                                      isDarkMode
                                        ? "hover:bg-gray-700 text-red-400"
                                        : "hover:bg-red-50 text-red-600"
                                    }`}
                                    title="Delete Offer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              className={`px-4 py-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              No ongoing offers found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center py-8 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <p>Please select a store</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            // onClick={() => setPreviewImage(null)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-70 hover:bg-opacity-100 rounded-full p-1 transition"
              >
                ✕
              </button>

              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}

        {/* add or edit offer */}

        {addOffer && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setAddOffer(false);
              setSelectedOffer(null);
            }}
          >
            <div
              className={`relative overflow-auto max-h-[90vh] w-full max-w-md mx-auto p-6 rounded-lg shadow-lg ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5" />
                {selectedOffer ? "Edit Offer" : "Add New Offer"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-300"
                    }`}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-300"
                    }`}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Offer Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, image: file });
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-md border cursor-pointer focus:outline-none ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  />
                  {(imagePreview || selectedOffer?.image) && (
                    <div className="mt-3 relative">
                      <img
                        src={imagePreview || selectedOffer?.image}
                        alt="Offer Preview"
                        className="w-full h-40 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image: null });
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-md border focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-md border focus:outline-none ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-300"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Display */}
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    className="mb-1"
                    checked={formData.display}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        display: e.target.checked,
                      }));
                    }}
                  />
                  <label className="block text-sm font-medium mb-1">
                    Display In Front Page
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAddOffer(false);
                      setSelectedOffer(null);
                      setImagePreview(null);
                      setFormData({
                        title: "",
                        description: "",
                        image: null,
                        startDate: "",
                        expiryDate: "",
                        display: false,
                      });
                    }}
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${
                      selectedOffer
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {selectedOffer ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* delete offer */}
        {confirmDelete && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setConfirmDelete(null)}
          >
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-sm ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-sm mb-4">
                Are you sure you want to delete{" "}
                <span className="font-medium text-red-500">
                  “{confirmDelete?.title}”
                </span>
                ?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className={`px-4 py-2 rounded-md ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default OffersPage;