import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
} from "../api/wheelApi";
import api from "../api/config";
import { toast } from "sonner";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminWheelDashboard() {
  const location = useLocation();
  const store = location.state.store;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  useEffect(() => {
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
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["wheelSegments", store._id], // storeID in queryKey for cache separation
    queryFn: () => getSegments(store._id).then((res) => res.data),
  });

  const [form, setForm] = useState({
    store: store._id, // Ensure the store ID is set from the context
    label: "",
    reward: null,
    color: "#facc15",
    value: 0,
    type: "points",
  });
  const [editing, setEditing] = useState(null);

  // ✅ Create Segment
  const createMutation = useMutation({
    mutationFn: createSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wheelSegments"] });
    },
  });

  // ✅ Update Segment
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSegment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wheelSegments"] });
      setEditing(null);
    },
  });

  // ✅ Delete Segment
  const deleteMutation = useMutation({
    mutationFn: deleteSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wheelSegments"] });
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

  return (
    <div className="p-4 max-w-4xl mx-auto bg-[#f2f5f9]">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Spin Wheel Configuration</h2>
        <p className="text-gray-600 text-xs">Total: {data?.length || 0} segments</p>
      </div>

      {/* Form */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-5 gap-2 items-end">
            {/* Type Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-blue-500 bg-white"
              >
                <option value="points">Points</option>
                <option value="rewards">Rewards</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            {/* Label/Reward Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {form.type === "rewards" ? "Reward" : "Label"}
              </label>
              {form.type === "rewards" ? (
                <select
                  value={form.reward || ""}
                  onChange={(e) => setForm({ ...form, reward: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-blue-500 bg-white"
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
                  placeholder="Label"
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-blue-500"
                />
              )}
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-7 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            {/* Value Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
              <input
                type="number"
                placeholder="1"
                min={0}
                required
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: Number(e.target.value) })
                }
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 text-xs rounded transition-colors"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="text-gray-500 text-xs">Loading segments...</div>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Label
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Color
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Value
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.length > 0 ? (
                  data.map((seg) => (
                    <tr key={seg._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs font-medium text-gray-900 max-w-20 truncate">
                        {seg.type === "rewards" ? seg.reward.name : seg.label}
                      </td>
                      <td className="px-3 py-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: seg.color }}
                        ></div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {seg.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {seg.value}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(seg)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(seg._id)}
                            className="text-red-600 hover:text-red-900 p-1"
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
                    <td colSpan="5" className="px-3 py-6 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-xs">No segments found</p>
                        <p className="text-xs text-gray-400">Add your first segment</p>
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
  );
}
