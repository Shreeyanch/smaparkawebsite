import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
} from "../api/wheelApi";
import api from "../api/config";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Store, ShipWheel } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const AdminWheelModal = ({ store, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      // Trigger animation after a short delay
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  useEffect(() => {
    if (isOpen && store) {
      const getRewards = async (storeId) => {
        setLoading(true);
        try {
          const response = await api.get(`/reward/getRewards/${storeId}`, {
            headers: { token },
          });

          if (response.data.success) {
            setRewards(response.data.rewards);
          } else {
            toast.error(response.data.message, {
              duration: 2000,
            });
          }
        } catch (error) {
          console.error(error);
          toast.error(error.message, {
            duration: 2000,
          });
        } finally {
          setLoading(false);
        }
      };
      getRewards(store._id);
    }
  }, [isOpen, store, token]);

  const { data, isLoading } = useQuery({
    queryKey: ["wheelSegments", store?._id],
    queryFn: () => getSegments(store._id).then((res) => res.data),
    enabled: isOpen && !!store,
  });

  const [form, setForm] = useState({
    store: store?._id || "",
    label: "",
    reward: null,
    color: "#facc15",
    value: "",
    type: "points",
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (store) {
      setForm(prev => ({ ...prev, store: store._id }));
    }
  }, [store]);

  // ✅ Create Segment
  const createMutation = useMutation({
    mutationFn: createSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wheelSegments"] });
      toast.success("Segment created successfully", { duration: 2000 });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create segment", { duration: 2000 });
    },
  });

  // ✅ Update Segment
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSegment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wheelSegments"] });
      setEditing(null);
      toast.success("Segment updated successfully", { duration: 2000 });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update segment", { duration: 2000 });
    },
  });

  // ✅ Delete Segment
  const deleteMutation = useMutation({
    mutationFn: deleteSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wheelSegments"] });
      toast.success("Segment deleted successfully", { duration: 2000 });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete segment", { duration: 2000 });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    editing
      ? updateMutation.mutate({ id: editing, data: form })
      : createMutation.mutate(form);
    setForm({
      store: store._id,
      label: "",
      reward: null,
      color: "#facc15",
      value: 0,
      type: "points",
    });
  };

  const handleEdit = (segment) => {
    setForm(segment);
    setEditing(segment._id);
  };

  const resetForm = () => {
    setForm({
      store: store?._id || "",
      label: "",
      reward: null,
      color: "#facc15",
      value: 0,
      type: "points",
    });
    setEditing(null);
  };

  if (!isOpen) return null;

  return (
     <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-end z-50 p-2 sm:p-4 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
    >
      <div
        className={`bg-white rounded-lg w-full sm:max-w-sm md:max-w-md max-h-[99vh] sm:max-h-[98vh] overflow-hidden transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
          <h2 className="flex gap-2 items-center text-xl font-semibold text-gray-900">
            <ShipWheel className="h-5 w-5" />
            <span className="hidden sm:inline">Spin Wheel Configuration</span>
            <span className="sm:hidden">Wheel Config</span>
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Store Info */}
        <div className="px-4 pt-3">
          
          
        <div className="flex gap-1 items-center justify-between">
            <div className="flex items-center gap-1">

            <Store className="h-4 w-4" />
            <span className="text-sm font-medium truncate">Store: {store?.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-600">Total segments: {data?.length || 0}</span>

        </div>

           
          
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(99vh-120px)] sm:max-h-[calc(98vh-140px)] relative"
             style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          {/* Loading Spinner - only show during form submission */}
          {(createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
              <LoadingSpinner />
            </div>
          )}

          {/* Form */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                {/* Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="points">Points</option>
                    <option value="rewards">Rewards</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                {/* Label/Reward Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {form.type === "rewards" ? "Reward" : "Label"}
                  </label>
                  {form.type === "rewards" ? (
                    <select
                      value={form.reward || ""}
                      onChange={(e) => setForm({ ...form, reward: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="" disabled>Select Reward</option>
                      {rewards
                        .filter((reward) => reward.type !== "constant")
                        .map((reward) => (
                          <option key={reward._id} value={reward._id}>
                            {reward.name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter label text"
                      required
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* Color and Value Row */}
                <div className="grid grid-cols-3 gap-3 items-end">
                  {/* Color Picker - Smaller box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-12 h-9 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                    <input
                      type="number"
                      placeholder="1"
                      required
                      value={form.value}
                      onChange={(e) =>
                        setForm({ ...form, value: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 text-sm rounded-md transition-colors"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending 
                        ? "..." 
                        : editing ? "Update" : "Add"
                      }
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-3 text-center">
                <div className="text-gray-500 text-sm">Loading segments...</div>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-sm font-medium text-gray-500 uppercase">
                        Label
                      </th>
                      <th className="px-2 py-1.5 text-left text-sm font-medium text-gray-500 uppercase w-8">
                        Color
                      </th>
                      <th className="px-2 py-1.5 text-left text-sm font-medium text-gray-500 uppercase w-16">
                        Type
                      </th>
                      <th className="px-2 py-1.5 text-left text-sm font-medium text-gray-500 uppercase w-10">
                        Value
                      </th>
                      <th className="px-2 py-1.5 text-left text-sm font-medium text-gray-500 uppercase w-12">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.length > 0 ? (
                      data.map((seg) => (
                        <tr key={seg._id} className="hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-sm font-medium text-gray-900">
                            <div className="break-words leading-tight">
                              {seg.type === "rewards" ? seg.reward.name : seg.label}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <div
                              className="w-3 h-3 rounded-full border border-gray-300 mx-auto"
                              style={{ backgroundColor: seg.color }}
                            ></div>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-800 capitalize">
                              {seg.type}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-sm text-gray-900 text-center">
                            {seg.value}
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center justify-center space-x-0.5">
                              <button
                                onClick={() => handleEdit(seg)}
                                className="text-blue-600 hover:text-blue-900 p-0.5"
                                disabled={deleteMutation.isPending}
                                title="Edit"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteMutation.mutate(seg._id)}
                                className="text-red-600 hover:text-red-900 p-0.5"
                                disabled={deleteMutation.isPending}
                                title="Delete"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-2 py-4 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-6 h-6 mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-sm">No segments found</p>
                            <p className="text-sm text-gray-400">Add your first segment</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-200">
          {editing && (
            <button
              onClick={resetForm}
              className="px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminWheelModal;
