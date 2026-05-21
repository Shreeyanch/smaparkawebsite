import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  FileEdit,
  Mail,
  LayoutDashboard,
  HelpCircle,
  Activity,
  Save,
  Award,
  Calendar,
  ArrowUpRight,
  Store,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/config";
import CustomizeRewardTemplate from "../components/rewardComponents/CustomizeRewardTemplate";
import RewardTemplate from "../components/rewardComponents/RewardTemplate";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import Description from "../components/Description";

const CreateReward = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const store = location.state?.store;
  const [stores, setStores] = useState([]);
  const [reward, setReward] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  if (!store || Object.keys(store).length === 0) {
    toast.error("Select Store", {
      duration: 1000,
      onAutoClose: () => navigate(-1),
    });
    return null;
  }

  // const [activePopup, setActivePopup] = useState(null); // Tracks which reward card has an open popup

  // const openDescriptionPopup = useCallback((index) => {
  //   setActivePopup(index);
  // }, []);

  // const closeDescriptionPopup = useCallback(() => {
  //   setActivePopup(null);
  // }, []);

  //Create Reward
  const getStoresAdmin = async () => {
    try {
      const response = await api.get("/store", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getStoresClient = async () => {
    try {
      const response = await api.get("/store/myStores", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (user.role == "admin") {
      getStoresAdmin();
    } else {
      getStoresClient();
    }
  }, []);

  useEffect(() => {
    if (stores.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        store: stores[0]._id,
        evergreen: false,
      }));
    }
  }, [stores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create a new FormData object
      const formDataToSend = new FormData();

      // Append each field to the FormData object
      // formDataToSend.append("store", formData.store);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("validity", formData.validity);
      formDataToSend.append("points", formData.points);
      formDataToSend.append("evergreen", formData.evergreen);

      // Append the file (image)
      if (templateData.image) {
        formDataToSend.append("image", templateData.image);
      }
      const response = await api.post(
        `/reward/createReward?storeId=${store._id}`,
        formDataToSend,
        { headers: { token } }
      );
      if (response.data.success) {
        // setReward(response.data.reward);
        // handleSaveTemplate(e, { ...response.data.reward });
        toast.success(response.data.message, {
          duration: 1000,

          onAutoClose: () =>
            // navigate("/reward/createReward/customize", {
            //   state: { ...response.data.reward },
            // }),
            navigate("/reward"),
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  //Customize Template
  const [templateData, setTemplateData] = useState({
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg",
    bgColor: "#111827",
    textColor: "#10B981",
    buttonColor: "#1F2937",
  });

  useEffect(() => {
    if (location.state) {
      setReward(location.state);
    }
  }, [location.state]);

  // Handle updating state dynamically
  const handleUpdate = (field, value) => {
    setTemplateData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //Save Template
  const handleSaveTemplate = async (e, store) => {
    setLoading(true);
    try {
      // Create a new FormData object
      const formDataToSend = new FormData();

      // Append each field to the FormData object
      formDataToSend.append("bgColor", templateData.bgColor);
      formDataToSend.append("textColor", templateData.textColor);
      formDataToSend.append("buttonColor", templateData.buttonColor);

      // Append the file (image)
      if (templateData.image) {
        formDataToSend.append("image", templateData.image);
      }
      const response = await api.put(
        `/reward/editReward/${store._id}?rewardId=${reward._id}`,
        formDataToSend,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
          onAutoClose: () => navigate("/reward"),
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:ml-60 bg-[#f2f5f9] min-h-screen">
      {loading && <LoadingSpinner />}
      
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6 bg-[#f2f5f9] p-4 border-b-2">
        <div className="flex items-center gap-3">
          <PlusCircle className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-medium text-black">Create New Reward</h1>
        </div>
        <button
          onClick={() => navigate("/reward")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-800 text-white rounded-lg transition-colors"
        >
          <LayoutDashboard size={18} />
          <span>Back to Rewards</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Reward Details</h2>
          
          <form className="space-y-6">
            {status === "create" && (
              <>
                {/* Store Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {store.name}
                  </div>
                </div>

                {/* Reward Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Enter reward name"
                      name="name"
                      required
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Reward Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Description
                  </label>
                  <textarea
                    placeholder="Enter reward description"
                    name="description"
                    required
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Upload Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpdate("image", e.target.files[0])}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {/* Customer Redeem Validity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Redeem Validity
                  </label>
                  <select
                    onChange={handleChange}
                    name="validity"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="instant">Instant</option>
                    {Array.from({ length: 365 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'day' : 'days'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reward Points */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Points <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      name="points"
                      required
                      onChange={handleChange}
                      placeholder="Enter reward points"
                      min={1}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Evergreen Mode */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="evergreen"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        evergreen: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-1"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Evergreen Mode
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/reward")}
                    className="px-6 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handelSubmit}
                    className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    Create Reward
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview</h2>
          
          <div className="flex justify-center">
            <div className="w-[270px] bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="relative">
                <img
                  className="w-full h-[130px] rounded-lg object-cover"
                  alt="Reward preview"
                  src={
                    templateData.image instanceof File ||
                    templateData.image instanceof Blob
                      ? URL.createObjectURL(templateData.image)
                      : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg"
                  }
                />
                <button className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                  <HelpCircle size={14} className="text-gray-500" />
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {formData.name || "Reward Name"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formData.points || "0"} Points
                  </p>
                </div>
                <button className="flex items-center gap-1 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors">
                  Redeem
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Validity:</span>
              <span className="text-gray-900">
                {formData.validity === "instant" ? "Instant" : `${formData.validity || 0} days`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Evergreen:</span>
              <span className="text-gray-900">
                {formData.evergreen ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Store:</span>
              <span className="text-gray-900">{store.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Form */}
      {status === "customize" && (
        <div className="px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customization Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customize Template</h2>
            <CustomizeRewardTemplate
              templateData={templateData}
              handleUpdate={handleUpdate}
              handleSubmit={handleSaveTemplate}
            />
          </div>

          {/* Right Column - Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Template Preview</h2>
            <div className="flex justify-center">
              <RewardTemplate
                {...templateData}
                image={
                  templateData.image instanceof File ||
                  templateData.image instanceof Blob
                    ? URL.createObjectURL(templateData.image)
                    : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg"
                }
                {...reward}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateReward;
