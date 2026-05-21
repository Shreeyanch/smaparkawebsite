import React, { useEffect, useState, useRef } from "react";
import { PlusCircle, LayoutDashboard, Save, Award } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Switch, TextField, FormControlLabel } from "@mui/material";
import { toast } from "sonner";
import api from "../api/config";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const CreateConstantReward = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = location.state.store;
  const isL4Format = store?.loyaltyCard?.format === "L4";
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({ ...prevData, image: file }));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({ ...prevData, image: null }));

    // Reset file input field
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    const formDataToSend = new FormData();

    // Append each field to the FormData object
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("tier", formData.tier);
    formDataToSend.append("redeemable", isL4Format ? true : (formData.redeemable || false));
    formDataToSend.append("redeemableTimes", formData.redeemableTimes || 1);
    
    // Add pointCost for L4 stores
    if (store?.loyaltyCard?.format === "L4") {
      formDataToSend.append("pointCost", formData.pointCost || 0);
    }

    // Append the file (image)
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    try {
      const response = await api.post(
        `/reward/createConstantReward?storeId=${store._id}`,
        formDataToSend,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,

          onAutoClose: () => navigate("/reward", { replace: true }),
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

  return (
    <div className="min-h-screen bg-stone-800 text-gray-300 p-6 sm:ml-64 mt-7 mr-7 rounded-2xl">
      {loading && <LoadingSpinner />}
      {/* Header */}
      <div className="flex items-center gap-2 text-emerald-400 mb-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <PlusCircle size={20} />
          <h1 className="text-xl font-medium">CREATE CONSTANT REWARD</h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 ml-auto bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 rounded-lg"
        >
          <LayoutDashboard size={18} />
          <span>Reward Dashboard</span>
        </button>
      </div>

      {/* Create Form */}
      <form onSubmit={handelSubmit}>
        <div className="max-w-4xl space-y-6">
          {/* Store Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <label className="text-gray-400">Store: </label>
              <span className="text-gray-300">{store.name}</span>
            </div>
          </div>

          {/* Reward Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-400">Reward Name</label>
              <span className="text-red-500">*</span>
            </div>
            <div className="relative">
              <Award
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Enter Reward Name"
                name="name"
                required
                onChange={handleChange}
                className="w-full bg-[#2A1F1F] rounded-lg pl-10 p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Reward Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-400">Reward Description</label>
            </div>
            <textarea
              placeholder="Reward Description"
              name="description"
              onChange={handleChange}
              className="w-full bg-[#2A1F1F] rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* Select Tier */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-400">Select Tier</label>
              <span className="text-red-500">*</span>
            </div>
            {store?.loyaltyCard?.tier ? (
              <select
                name="tier"
                required
                onChange={handleChange}
                className="w-full bg-[#2A1F1F] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="" selected disabled>
                  Select Tier
                </option>
                {store.loyaltyCard.tier.map((tier) => (
                  <option key={tier._id} value={tier.name}>
                    {tier.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-400">No tiers available</p>
            )}{" "}
          </div>

          {/* Redeemable — hidden for L4 (always redeemable, controlled by pointCost) */}
          {!isL4Format && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="redeemable"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    redeemable: e.target.checked,
                  }))
                }
                value={formData.redeemable}
                className="w-4 h-4 rounded bg-[#2A1F1F] border-gray-500"
              />
              <label className="text-gray-400">Redeemable</label>
            </div>
          </div>
          )}

          {/* Redeemable Times */}
          {!isL4Format && formData.redeemable && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-gray-400">Reward Redeemable Times</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.redeemableTimes}
                  onChange={handleChange}
                  name="redeemableTimes"
                  className="w-full bg-[#2A1F1F] rounded-lg px-5 p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>
          )}

          {/* Point Cost - Only for L4 stores */}
          {store?.loyaltyCard?.format === "L4" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-gray-400">Point Cost</label>
                <span className="text-red-500">*</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.pointCost || 0}
                  onChange={handleChange}
                  name="pointCost"
                  min="0"
                  required={store?.loyaltyCard?.format === "L4"}
                  placeholder="Enter points required to redeem"
                  className="w-full bg-[#2A1F1F] rounded-lg px-5 p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <p className="text-xs text-gray-500">Points required to redeem this reward</p>
            </div>
          )}

          {/* Reward Image */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-400">Reward Image</label>{" "}
              <span className="text-red-500">*</span>
            </div>
            <input
              type="file"
              name="image"
              required
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="w-full bg-[#2A1F1F] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          {/* Image Preview */}
          {formData.image && (
            <div className="relative w-36 rounded-lg overflow-hidden border border-gray-700 shadow-md mt-4">
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Reward Preview"
                className="w-full h-auto rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-700 transition duration-200"
              >
                &times;
              </button>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#3A2F2F] text-white px-6 py-2 rounded-lg hover:bg-[#2A1F1F] transition-colors"
          >
            <Save size={18} />
            <span>Save</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateConstantReward;
