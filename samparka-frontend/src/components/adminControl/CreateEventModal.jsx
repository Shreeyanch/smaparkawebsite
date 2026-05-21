import { useState, useEffect } from "react";
import { X, Calendar, Zap, Clock, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const EVENT_TYPES = [
  { value: "marketing_campaign",    label: "Marketing Campaign",    dot: "#2563eb" },
  { value: "seasonal_promotion",    label: "Seasonal Promotion",    dot: "#d97706" },
  { value: "customer_followup",     label: "Customer Follow-up",    dot: "#7c3aed" },
  { value: "general_announcement",  label: "General Announcement",  dot: "#059669" },
  { value: "billing_reminder",      label: "Billing Reminder",      dot: "#dc2626" },
];

const TYPE_ACTIVE = {
  marketing_campaign:   "bg-blue-50 border-blue-400 text-blue-700",
  seasonal_promotion:   "bg-amber-50 border-amber-400 text-amber-700",
  customer_followup:    "bg-violet-50 border-violet-400 text-violet-700",
  general_announcement: "bg-emerald-50 border-emerald-400 text-emerald-700",
  billing_reminder:     "bg-red-50 border-red-400 text-red-700",
};
const TYPE_ACTIVE_DARK = {
  marketing_campaign:   "bg-blue-900/30 border-blue-500 text-blue-300",
  seasonal_promotion:   "bg-amber-900/30 border-amber-500 text-amber-300",
  customer_followup:    "bg-violet-900/30 border-violet-500 text-violet-300",
  general_announcement: "bg-emerald-900/30 border-emerald-500 text-emerald-300",
  billing_reminder:     "bg-red-900/30 border-red-500 text-red-300",
};

const CreateEventModal = ({ onClose, onSuccess, stores = [], existingEvent = null }) => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;

  const isEditing = !!existingEvent;

  // "schedule" | "sendNow"
  const [mode, setMode] = useState("schedule");
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "general_announcement",
    scheduledAt: "",
    targetStores: [],
  });
  const [loading, setLoading] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");

  useEffect(() => {
    if (existingEvent) {
      const dt = new Date(existingEvent.scheduledAt);
      const pad = (n) => String(n).padStart(2, "0");
      const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      setForm({
        title: existingEvent.title || "",
        description: existingEvent.description || "",
        type: existingEvent.type || "general_announcement",
        scheduledAt: local,
        targetStores: existingEvent.targetStores?.map((s) => (typeof s === "object" ? s._id : s)) || [],
      });
      setMode("schedule");
    }
  }, [existingEvent]);

  const toggleStore = (id) =>
    setForm((p) => ({
      ...p,
      targetStores: p.targetStores.includes(id)
        ? p.targetStores.filter((x) => x !== id)
        : [...p.targetStores, id],
    }));

  const filteredStores = stores.filter((s) =>
    s.name?.toLowerCase().includes(storeSearch.toLowerCase())
  );

  const allSelected =
    filteredStores.length > 0 &&
    filteredStores.every((s) => form.targetStores.includes(s._id));

  const toggleAll = () =>
    setForm((p) => ({
      ...p,
      targetStores: allSelected
        ? p.targetStores.filter((id) => !filteredStores.find((s) => s._id === id))
        : [...new Set([...p.targetStores, ...filteredStores.map((s) => s._id)])],
    }));

  const validate = () => {
    if (!form.title.trim())        { toast.error("Title is required"); return false; }
    if (!form.description.trim())  { toast.error("Description is required"); return false; }
    if (!form.targetStores.length) { toast.error("Select at least one store"); return false; }
    if (mode === "schedule" && !form.scheduledAt) { toast.error("Pick a send date and time"); return false; }
    return true;
  };

  const handleSubmit = async (submitMode) => {
    if (!validate()) return;
    setLoading(true);
    try {
      let response;
      if (isEditing) {
        const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
        response = await api.put(`/api/adminControl/events/${existingEvent._id}`, payload, {
          headers: { token },
        });
      } else if (submitMode === "sendNow") {
        const payload = {
          title: form.title,
          description: form.description,
          type: form.type,
          targetStores: form.targetStores,
        };
        response = await api.post("/api/adminControl/events/sendNow", payload, { headers: { token } });
      } else {
        const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
        response = await api.post("/api/adminControl/events", payload, { headers: { token } });
      }

      if (response.data.success) {
        const label = isEditing
          ? "Event updated"
          : submitMode === "sendNow"
          ? "Event sent"
          : "Event scheduled";
        toast.success(label + " successfully");
        onSuccess(response.data.data.event);
        onClose();
      } else {
        toast.error(response.data.message || "Failed to save event");
      }
    } catch (err) {
      console.error("CreateEventModal error:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ── Style tokens ────────────────────────────────────────────────── */
  const surface = isDarkMode ? "bg-gray-900 border-gray-700/80" : "bg-white border-gray-200";
  const divider = isDarkMode ? "border-gray-700/80" : "border-gray-100";
  const muted   = isDarkMode ? "text-gray-400" : "text-gray-500";
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
    focus:ring-2 focus:ring-green-500/40 focus:border-green-500
    ${isDarkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`;
  const labelCls = `block text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${muted}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full sm:max-w-xl max-h-[95dvh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl border shadow-2xl ${surface}`}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${divider} shrink-0`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <Calendar className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`} />
            </div>
            <div>
              <h2 className={`text-sm font-semibold leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {isEditing ? "Edit Event" : "New Event"}
              </h2>
              <p className={`text-xs ${muted}`}>
                {isEditing ? "Update event details" : "Notify store users via email"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Title */}
            <div>
              <label className={labelCls}>Title</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Double Points Weekend"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                maxLength={120}
              />
            </div>

            {/* Type chips */}
            <div>
              <label className={labelCls}>Type</label>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map((et) => {
                  const active = form.type === et.value;
                  return (
                    <button
                      key={et.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type: et.value }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                        active
                          ? isDarkMode
                            ? TYPE_ACTIVE_DARK[et.value]
                            : TYPE_ACTIVE[et.value]
                          : isDarkMode
                          ? "bg-transparent border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400"
                          : "bg-transparent border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: active ? et.dot : "currentColor",
                          opacity: active ? 1 : 0.4,
                        }}
                      />
                      {et.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Message</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="Describe the event or action for store admins..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Delivery mode toggle — new events only */}
            {!isEditing && (
              <div>
                <label className={labelCls}>Delivery</label>
                <div className={`inline-flex rounded-lg p-0.5 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                  <button
                    type="button"
                    onClick={() => setMode("sendNow")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      mode === "sendNow"
                        ? isDarkMode
                          ? "bg-gray-700 text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : `${muted} hover:text-gray-600`
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    Send Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("schedule")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      mode === "schedule"
                        ? isDarkMode
                          ? "bg-gray-700 text-white shadow-sm"
                          : "bg-white text-gray-900 shadow-sm"
                        : `${muted} hover:text-gray-600`
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Schedule
                  </button>
                </div>
              </div>
            )}

            {/* Datetime — schedule mode or editing */}
            {(mode === "schedule" || isEditing) && (
              <div>
                <label className={labelCls}>Send Date &amp; Time</label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.scheduledAt}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}

            {/* Send Now info strip */}
            {mode === "sendNow" && !isEditing && (
              <div className={`flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-xs ${
                isDarkMode
                  ? "bg-amber-900/20 border border-amber-700/40 text-amber-300"
                  : "bg-amber-50 border border-amber-200 text-amber-700"
              }`}>
                <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  This event will be emailed to all selected stores immediately upon clicking Send Now.
                </span>
              </div>
            )}

            {/* Target stores */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls} style={{ marginBottom: 0 }}>
                  Stores
                  <span className={`ml-1.5 normal-case tracking-normal font-normal ${muted}`}>
                    {form.targetStores.length} selected
                  </span>
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className={`text-xs font-medium transition-colors ${
                    isDarkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"
                  }`}
                >
                  {allSelected ? "Deselect all" : "Select all"}
                  {storeSearch ? " (filtered)" : ""}
                </button>
              </div>

              <input
                type="text"
                className={`${inputCls} mb-2`}
                placeholder="Filter stores..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
              />

              <div className={`max-h-44 overflow-y-auto rounded-lg border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                {filteredStores.length === 0 ? (
                  <p className={`p-4 text-xs text-center ${muted}`}>No stores found</p>
                ) : (
                  filteredStores.map((store) => {
                    const selected = form.targetStores.includes(store._id);
                    return (
                      <label
                        key={store._id}
                        className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors border-b last:border-b-0 ${
                          isDarkMode
                            ? `border-gray-800 ${selected ? "bg-green-900/20" : "hover:bg-gray-800/60"}`
                            : `border-gray-50 ${selected ? "bg-green-50/70" : "hover:bg-gray-50"}`
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-green-600 w-3.5 h-3.5 shrink-0"
                          checked={selected}
                          onChange={() => toggleStore(store._id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate leading-tight ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                            {store.name}
                          </p>
                          <p className={`text-xs capitalize ${muted}`}>{store.type}</p>
                        </div>
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
                      </label>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className={`px-5 py-4 border-t ${divider} shrink-0`}>
          {isEditing ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit("schedule")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Calendar className="w-4 h-4" />}
                {loading ? "Saving..." : "Update Event"}
              </button>
            </div>
          ) : mode === "sendNow" ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit("sendNow")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Zap className="w-4 h-4" />}
                {loading
                  ? "Sending..."
                  : `Send Now · ${form.targetStores.length} store${form.targetStores.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit("schedule")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDarkMode
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  : <ChevronRight className="w-4 h-4" />}
                {loading ? "Scheduling..." : "Schedule Event"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateEventModal;
