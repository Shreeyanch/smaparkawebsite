import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/config";
import { Store, Lock, Key, AlertCircle, Shield, Gift, UserCheck, Info } from "lucide-react";
import { toast } from "sonner";
import StoreSelector from "../components/common/StoreSelector";

export default function StoreSettings() {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pin");

  // PIN Change State
  const [oldPIN, setOldPIN] = useState("");
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [isChangingPIN, setIsChangingPIN] = useState(false);

  // Customer Settings State
  const [customerSettings, setCustomerSettings] = useState({
    givePointsOnRegister: false,
    limitPoints: false,
    needCustomerDOB: false,
    needCustomerGender: false,
    needBillID: false,
    needBillIDForReward: false,
    doublePoints: false,
    doublePointsDays: [],
    letSubAdminToGiveManualPoints: false,
    letSubAdminToClaimRewards: false,
    showPhoneNumberOnSubAdmin: false,
    showEmailOnSubAdmin: false,
    requireEmailOTP: true,
    requirePhoneOTP: false,
    whatsapp: false,
    whatsappOrder: false,
    amount: false,
    conversionRate: "",
    pointValue: "",
    isRounded: false,
    hasExpiry: false,
    expiryDays: 90,
    // L4 Loyalty Format Settings
    pointEarnRate: 0.07,
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // L4 Settings Local State (for save button)
  const [l4Settings, setL4Settings] = useState({
    pointEarnRate: 0.07,
  });
  const [hasL4Changes, setHasL4Changes] = useState(false);
  const [isSavingL4, setIsSavingL4] = useState(false);

  const tabs = [
    { id: "pin", label: "PIN", icon: <Lock className="w-4 h-4" /> },
    { id: "points", label: "Points & Rewards", icon: <Gift className="w-4 h-4" /> },
    { id: "customer", label: "Customer Info", icon: <UserCheck className="w-4 h-4" /> },
    { id: "subadmin", label: "Sub-Admin", icon: <Shield className="w-4 h-4" /> },
    { id: "whatsapp", label: "WhatsApp", icon: <Gift className="w-4 h-4" /> },
    ...(user?.role === "admin" ? [{ id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> }] : []),
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      loadCustomerSettings();
    }
  }, [selectedStore]);

  const loadCustomerSettings = () => {
    if (selectedStore) {
      setCustomerSettings({
        givePointsOnRegister: selectedStore.givePointsOnRegister || false,
        limitPoints: selectedStore.limitPoints || false,
        needCustomerDOB: selectedStore.needCustomerDOB || false,
        needCustomerGender: selectedStore.needCustomerGender || false,
        needBillID: selectedStore.needBillID || false,
        needBillIDForReward: selectedStore.needBillIDForReward || false,
        doublePoints: selectedStore.doublePoints || false,
        doublePointsDays: selectedStore.doublePointsDays || [],
        letSubAdminToGiveManualPoints: selectedStore.letSubAdminToGiveManualPoints || false,
        letSubAdminToClaimRewards: selectedStore.letSubAdminToClaimRewards ?? true,
        showPhoneNumberOnSubAdmin: selectedStore.showPhoneNumberOnSubAdmin || false,
        showEmailOnSubAdmin: selectedStore.showEmailOnSubAdmin || false,
        requireEmailOTP: selectedStore.requireEmailOTP ?? true,
        requirePhoneOTP: selectedStore.requirePhoneOTP || false,
        whatsapp: selectedStore.whatsapp || false,
        whatsappOrder: selectedStore.whatsappOrder || false,
        amount: selectedStore.amount || false,
        conversionRate: selectedStore.conversionRate || "",
        pointValue: selectedStore.pointValue || "",
        isRounded: selectedStore.isRounded || false,
        hasExpiry: selectedStore.hasExpiry || false,
        expiryDays: selectedStore.expiryDays || 90,
        // L4 Loyalty Format Settings
        pointEarnRate: selectedStore.pointEarnRate || 0.07,
      });
      
      // Load L4 settings separately
      setL4Settings({
        pointEarnRate: selectedStore.pointEarnRate || 0.07,
      });
      setHasL4Changes(false);
    }
  };

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const endpoint = user?.role === "admin" ? "/store" : "/store/myStores";
      const response = await api.get(endpoint, { headers: { token } });

      if (response.data.success) {
        const storesList = user?.role === "admin" ? response.data.stores : response.data.stores;
        setStores(storesList || []);
        if (storesList && storesList.length > 0) {
          setSelectedStore(storesList[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePIN = async (e) => {
    e.preventDefault();

    if (!oldPIN || !newPIN || !confirmPIN) {
      toast.error("All fields are required!");
      return;
    }

    if (newPIN.length !== 4 || !/^\d+$/.test(newPIN)) {
      toast.error("New PIN must be exactly 4 digits!");
      return;
    }

    if (newPIN !== confirmPIN) {
      toast.error("New PIN and Confirm PIN do not match!");
      return;
    }

    if (oldPIN === newPIN) {
      toast.error("New PIN must be different from old PIN!");
      return;
    }

    setIsChangingPIN(true);
    try {
      const response = await api.post(
        `/store/changePIN/${selectedStore._id}`,
        { oldPIN, newPIN },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("PIN changed successfully!");
        setOldPIN("");
        setNewPIN("");
        setConfirmPIN("");
      } else {
        toast.error(response.data.message || "Failed to change PIN");
      }
    } catch (error) {
      console.error("Error changing PIN:", error);
      toast.error(error.response?.data?.message || "Failed to change PIN");
    } finally {
      setIsChangingPIN(false);
    }
  };

  const handleCustomerSettingChange = async (settingKey, value) => {
    setCustomerSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));

    setIsUpdatingSettings(true);
    try {
      const response = await api.put(
        `/store/editStore?storeId=${selectedStore._id}`,
        { [settingKey]: value },
        { headers: { token } }
      );

      if (response.data.success) {
        const updatedStore = { ...selectedStore, [settingKey]: value };
        setSelectedStore(updatedStore);
        setStores(stores.map(s => s._id === selectedStore._id ? updatedStore : s));
        toast.success("Setting updated successfully!");
      } else {
        setCustomerSettings(prev => ({
          ...prev,
          [settingKey]: !value
        }));
        toast.error(response.data.message || "Failed to update setting");
      }
    } catch (error) {
      setCustomerSettings(prev => ({
        ...prev,
        [settingKey]: !value
      }));
      console.error("Error updating setting:", error);
      toast.error(error.response?.data?.message || "Failed to update setting");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleDoublePointsDaysChange = async (dayIndex, checked) => {
    const prev = customerSettings.doublePointsDays || [];
    const newDays = checked
      ? [...new Set([...prev, dayIndex])].sort((a, b) => a - b)
      : prev.filter((d) => d !== dayIndex);

    setCustomerSettings((s) => ({ ...s, doublePointsDays: newDays }));
    setIsUpdatingSettings(true);
    try {
      const response = await api.put(
        `/store/editStore?storeId=${selectedStore._id}`,
        { doublePointsDays: newDays },
        { headers: { token } }
      );
      if (response.data.success) {
        const updatedStore = { ...selectedStore, doublePointsDays: newDays };
        setSelectedStore(updatedStore);
        setStores(stores.map((s) => (s._id === selectedStore._id ? updatedStore : s)));
        toast.success("Double points days updated!");
      } else {
        setCustomerSettings((s) => ({ ...s, doublePointsDays: prev }));
        toast.error(response.data.message || "Failed to update");
      }
    } catch (error) {
      setCustomerSettings((s) => ({ ...s, doublePointsDays: prev }));
      toast.error("Failed to update double points days");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSaveL4Settings = async () => {
    setIsSavingL4(true);
    try {
      const response = await api.put(
        `/store/editStore?storeId=${selectedStore._id}`,
        { pointEarnRate: l4Settings.pointEarnRate },
        { headers: { token } }
      );

      if (response.data.success) {
        const updatedStore = { ...selectedStore, pointEarnRate: l4Settings.pointEarnRate };
        setSelectedStore(updatedStore);
        setStores(stores.map(s => s._id === selectedStore._id ? updatedStore : s));
        setCustomerSettings(prev => ({ ...prev, pointEarnRate: l4Settings.pointEarnRate }));
        setHasL4Changes(false);
        toast.success("L4 settings saved successfully!");
      } else {
        toast.error(response.data.message || "Failed to save L4 settings");
      }
    } catch (error) {
      console.error("Error saving L4 settings:", error);
      toast.error(error.response?.data?.message || "Failed to save L4 settings");
    } finally {
      setIsSavingL4(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
      {/* Header Section */}
      <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between w-full mb-6 p-4 border-b-2 gap-4 ${
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-[#f2f5f9] border-gray-200"
      }`}>
        {/* Left: Title and Description */}
        <div className="flex flex-col gap-1">
          <h1 className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
            Store Settings
          </h1>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Manage your store security, customer experience, and team permissions
          </p>
        </div>

        {/* Right: Store Selector */}
        {(user?.role === "admin" || stores.length > 1) && stores.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <StoreSelector
              selectedStore={selectedStore}
              onStoreChange={(store) => {
                setSelectedStore(store);
                setOldPIN("");
                setNewPIN("");
                setConfirmPIN("");
              }}
              variant="default"
              customStores={stores}
              fetchOnMount={false}
            />
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="px-4">
        {selectedStore && (
          <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            {/* Navigation Tabs */}
            <div className={`border-b ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
              <div className="flex items-center px-4 sm:px-6">
                <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                        tab.id !== tabs[0].id ? "ml-4 sm:ml-8" : ""
                      } ${
                        activeTab === tab.id
                          ? isDarkMode
                            ? "border-green-400 text-green-400"
                            : "border-green-500 text-green-600"
                          : isDarkMode
                            ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className={`p-1 sm:p-1.5 rounded-lg ${
                        activeTab === tab.id
                          ? isDarkMode ? "bg-green-900/30" : "bg-green-50"
                          : isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}>
                        {tab.icon}
                      </div>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className={`p-3 sm:p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
              {/* PIN Tab */}
              {activeTab === "pin" && (
                <SettingsSection
                  title="Change Store PIN"
                  description="Update your store's 4-digit PIN for customer check-ins"
                  isDarkMode={isDarkMode}
                >
                  {/* Info Alert */}
                  <div className={`flex gap-3 p-4 rounded-lg mb-6 ${
                    isDarkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
                  }`}>
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${
                        isDarkMode ? "text-blue-300" : "text-blue-900"
                      }`}>
                        PIN Requirements
                      </p>
                      <ul className={`text-sm space-y-1 ${
                        isDarkMode ? "text-blue-400" : "text-blue-700"
                      }`}>
                        <li>Must be exactly 4 digits</li>
                        <li>Must be different from your current PIN</li>
                        <li>Used by customers to check-in and earn points</li>
                      </ul>
                    </div>
                  </div>

                  <form onSubmit={handleChangePIN}>
                    <div className="space-y-4 mb-6">
                      <SettingInput
                        label="Current PIN"
                        description="Enter your existing store PIN"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={oldPIN}
                        onChange={(e) => setOldPIN(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter current PIN"
                        isDarkMode={isDarkMode}
                      />
                      <SettingInput
                        label="New PIN"
                        description="Choose a new 4-digit PIN"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={newPIN}
                        onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter new PIN"
                        isDarkMode={isDarkMode}
                      />
                      <SettingInput
                        label="Confirm PIN"
                        description="Re-enter the new PIN to confirm"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={confirmPIN}
                        onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ""))}
                        placeholder="Confirm new PIN"
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setOldPIN("");
                          setNewPIN("");
                          setConfirmPIN("");
                        }}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPIN || !oldPIN || !newPIN || !confirmPIN}
                        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isChangingPIN ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            Change PIN
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </SettingsSection>
              )}

              {/* Points & Rewards Tab */}
              {activeTab === "points" && (
                <div className="space-y-8">
                  {/* Points & Rewards Basic Settings */}
                  <SettingsSection
                    title="Points & Rewards"
                    description="Configure how customers earn and redeem points at your store"
                    isDarkMode={isDarkMode}
                  >
                    <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                      <SettingToggle
                        label="Give 1 Point on Registration"
                        description="Reward new customers with a point when they first register"
                        checked={customerSettings.givePointsOnRegister}
                        onChange={(val) => handleCustomerSettingChange('givePointsOnRegister', val)}
                        isDarkMode={isDarkMode}
                        infoText="When enabled, customers automatically receive 1 loyalty point as a welcome bonus when they create their account. This encourages sign-ups and gives new customers an immediate benefit."
                      />
                      <SettingToggle
                        label="Limit Points to Once Per Day"
                        description="Customers can only earn points once every 24 hours"
                        checked={customerSettings.limitPoints}
                        onChange={(val) => handleCustomerSettingChange('limitPoints', val)}
                        isDarkMode={isDarkMode}
                        infoText="Prevents customers from earning multiple points in a single day. Useful to prevent abuse and encourage customers to return daily rather than making multiple visits in one day."
                      />
                      <SettingToggle
                        label="Require Bill ID for Points"
                        description="Customers must provide a bill ID when earning points"
                        checked={customerSettings.needBillID}
                        onChange={(val) => handleCustomerSettingChange('needBillID', val)}
                        isDarkMode={isDarkMode}
                        infoText="When enabled, customers must provide a valid bill or invoice number to earn points. This helps verify purchases and prevents fraudulent point claims."
                      />
                      <SettingToggle
                        label="Require Bill ID for Rewards"
                        description="Customers must provide a bill ID when redeeming rewards"
                        checked={customerSettings.needBillIDForReward}
                        onChange={(val) => handleCustomerSettingChange('needBillIDForReward', val)}
                        isDarkMode={isDarkMode}
                        infoText="When enabled, customers must provide a bill or invoice number when redeeming their rewards. This helps track redemptions and ensure rewards are used with actual purchases."
                      />
                      <SettingToggle
                        label="Double Points"
                        description="Customers earn double points on selected days of the week"
                        checked={customerSettings.doublePoints}
                        onChange={(val) => handleCustomerSettingChange('doublePoints', val)}
                        isDarkMode={isDarkMode}
                        infoText="When enabled, customers earn double points on the selected days of the week. Choose any combination of Sunday through Saturday to run your double points promotion."
                      />
                      {customerSettings.doublePoints && (
                        <div className={`mt-3 ml-0 p-4 rounded-lg border ${isDarkMode ? "bg-gray-700/40 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                          <p className={`text-xs font-medium mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Select double points days
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
                              const isSelected = (customerSettings.doublePointsDays || []).includes(index);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleDoublePointsDaysChange(index, !isSelected)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    isSelected
                                      ? isDarkMode
                                        ? "bg-green-600 text-white"
                                        : "bg-green-500 text-white"
                                      : isDarkMode
                                        ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </SettingsSection>

                  {/* Points System Configuration */}
                  <div className={`border-t pt-8 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <SettingsSection
                      title="Points System Configuration"
                      description="Set up how customers earn and redeem points"
                      isDarkMode={isDarkMode}
                    >
                      {/* Points vs Amount Toggle */}
                      <div className="mb-6">
                        <div className={`flex border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                          <button
                            type="button"
                            onClick={() => handleCustomerSettingChange('amount', false)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                              !customerSettings.amount
                                ? isDarkMode
                                  ? "border-green-400 text-green-400"
                                  : "border-green-600 text-green-600"
                                : isDarkMode
                                  ? "border-transparent text-gray-400 hover:text-gray-300"
                                  : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            Points
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCustomerSettingChange('amount', true)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                              customerSettings.amount
                                ? isDarkMode
                                  ? "border-green-400 text-green-400"
                                  : "border-green-600 text-green-600"
                                : isDarkMode
                                  ? "border-transparent text-gray-400 hover:text-gray-300"
                                  : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            Amount (Rupees)
                          </button>
                        </div>
                      </div>

                      {!customerSettings.amount ? (
                        <div className={`p-4 rounded-lg mb-6 ${
                          isDarkMode ? "bg-gray-900/50" : "bg-gray-50"
                        }`}>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Points can be customly given, meaning you can assign as many points as you want, regardless of the amount spent.
                          </p>
                        </div>
                      ) : (
                        <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"} mb-6`}>
                          <SettingInput
                            label="Conversion Rate"
                            description="How many rupees = 1 point (e.g., Rs. 100 = 1 point)"
                            type="text"
                            inputMode="decimal"
                            value={customerSettings.conversionRate}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow numbers and decimal point
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleCustomerSettingChange('conversionRate', value);
                              }
                            }}
                            placeholder="100"
                            isDarkMode={isDarkMode}
                            infoText="Set how much money customers need to spend to earn 1 point. For example, if you set this to 100, customers will earn 1 point for every Rs. 100 they spend. Lower values mean customers earn points faster."
                          />
                          <SettingInput
                            label="Point Value"
                            description="How much 1 point is worth when redeemed (e.g., 1 point = Rs. 10)"
                            type="text"
                            inputMode="decimal"
                            value={customerSettings.pointValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow numbers and decimal point
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleCustomerSettingChange('pointValue', value);
                              }
                            }}
                            placeholder="10"
                            isDarkMode={isDarkMode}
                            infoText="Set the monetary value of each point when customers redeem them. For example, if you set this to 10, each point is worth Rs. 10 when redeemed. This determines the discount customers receive when using their points."
                          />
                        </div>
                      )}

                      <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                        <SettingToggle
                          label="Round Points"
                          description="Round points to the nearest whole number"
                          checked={customerSettings.isRounded}
                          onChange={(val) => handleCustomerSettingChange('isRounded', val)}
                          isDarkMode={isDarkMode}
                          tooltipPosition="top"
                          infoText="When enabled, fractional points are rounded to the nearest whole number. For example, 2.7 points becomes 3 points, and 2.3 points becomes 2 points. This simplifies the points system for customers."
                        />
                        <SettingToggle
                          label="Points Expiry"
                          description="Enable automatic expiration of points after a set number of days"
                          checked={customerSettings.hasExpiry}
                          onChange={(val) => handleCustomerSettingChange('hasExpiry', val)}
                          isDarkMode={isDarkMode}
                          tooltipPosition="top"
                          infoText="When enabled, customer points will automatically expire after the specified number of days. This encourages customers to redeem points regularly and helps manage your loyalty program costs. Points are counted from the date they were earned."
                        />
                        {customerSettings.hasExpiry && (
                          <SettingInput
                            label="Expiry Days"
                            description="Number of days before points expire (30-365 days)"
                            type="number"
                            min="30"
                            max="365"
                            value={customerSettings.expiryDays}
                            onChange={(e) => handleCustomerSettingChange('expiryDays', Number(e.target.value))}
                            placeholder="90"
                            isDarkMode={isDarkMode}
                            tooltipPosition="top"
                            infoText="Specify how many days until points expire. Choose between 30 to 365 days. A shorter period (e.g., 90 days) encourages faster redemption, while a longer period (e.g., 365 days) gives customers more flexibility. The countdown starts from when each point is earned."
                          />
                        )}
                      </div>
                    </SettingsSection>
                  </div>

                  {/* L4 Format Settings - Only shown for L4 stores */}
                  {selectedStore?.loyaltyCard?.format === "L4" && (
                    <div className={`border-t pt-8 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                      <SettingsSection
                        title="L4 Dynamic Tiers Configuration"
                        description="Configure automatic discounts and point earning rates for your L4 loyalty program"
                        isDarkMode={isDarkMode}
                      >
                        <div className={`p-4 rounded-lg mb-6 ${
                          isDarkMode ? "bg-blue-900/10 border border-blue-500/30" : "bg-blue-50 border border-blue-200"
                        }`}>
                          <div className="flex items-start gap-3">
                            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                            <div>
                              <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-blue-300" : "text-blue-900"}`}>
                                L4 Format: Point Earn Rate
                              </p>
                              <p className={`text-xs ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}>
                                Configure how customers earn points. Discounts are set per tier in the Loyalty Card Designer.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                          <div className="py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                                  Point Earn Rate (%)
                                </label>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  Percentage of bill amount given as points
                                </p>
                              </div>
                              <div className="relative w-full sm:w-48">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={(() => {
                                    const percentValue = l4Settings.pointEarnRate * 100;
                                    // Remove floating point precision errors
                                    return percentValue % 1 === 0 ? percentValue.toString() : percentValue.toFixed(2).replace(/\.?0+$/, '');
                                  })()}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty, numbers, and decimal
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      const percentValue = value === '' ? 0 : parseFloat(value);
                                      // Clamp between 0 and 100
                                      const clampedPercent = Math.min(100, Math.max(0, percentValue));
                                      // Convert percentage to decimal (7 -> 0.07)
                                      const decimalValue = clampedPercent / 100;
                                      setL4Settings({ pointEarnRate: decimalValue });
                                      setHasL4Changes(true);
                                    }
                                  }}
                                  placeholder="7"
                                  className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors ${
                                    isDarkMode
                                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                />
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}>
                                  %
                                </span>
                              </div>
                            </div>
                            <div className={`mt-2 flex items-start gap-2 p-3 rounded-lg ${
                              isDarkMode ? "bg-blue-900/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"
                            }`}>
                              <Info className={`w-4 h-4 mt-0.5 shrink-0 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                              <p className={`text-xs ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                                Example: Enter 7 for 7% earn rate. On a Rs. 1000 bill (after applying any tier discount), customer earns points based on this percentage. You can also use decimals like 7.5 for more precise rates.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={`mt-4 p-3 rounded-lg ${
                          isDarkMode ? "bg-gray-900/50 border border-gray-700" : "bg-gray-50 border border-gray-200"
                        }`}>
                          <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Quick Preview:
                          </p>
                          <div className={`text-xs space-y-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <p>• Bill Amount: Rs. 1,000</p>
                            <p>• Current Earn Rate: {(() => {
                              const percentValue = l4Settings.pointEarnRate * 100;
                              return percentValue % 1 === 0 ? percentValue : percentValue.toFixed(2).replace(/\.?0+$/, '');
                            })()}%</p>
                            <p className={`font-medium ${isDarkMode ? "text-green-400" : "text-green-600"}`}>• Base Points Earned: {(1000 * l4Settings.pointEarnRate).toFixed(2)} points</p>
                            <p className={`text-xs italic ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>(Tier discounts are applied during actual transactions)</p>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={handleSaveL4Settings}
                            disabled={!hasL4Changes || isSavingL4}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                              !hasL4Changes || isSavingL4
                                ? isDarkMode
                                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : isDarkMode
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                            }`}
                          >
                            {isSavingL4 ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </SettingsSection>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Info Tab */}
              {activeTab === "customer" && (
                <SettingsSection
                  title="Customer Information"
                  description="Choose what information to collect from customers during registration"
                  isDarkMode={isDarkMode}
                >
                  <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                    <SettingToggle
                      label="Collect Date of Birth"
                      description="Require customers to provide their birthdate during registration"
                      checked={customerSettings.needCustomerDOB}
                      onChange={(val) => handleCustomerSettingChange('needCustomerDOB', val)}
                      isDarkMode={isDarkMode}
                    />
                    <SettingToggle
                      label="Collect Gender Information"
                      description="Require customers to specify their gender during registration"
                      checked={customerSettings.needCustomerGender}
                      onChange={(val) => handleCustomerSettingChange('needCustomerGender', val)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </SettingsSection>
              )}

              {/* Sub-Admin Tab */}
              {activeTab === "subadmin" && (
                <SettingsSection
                  title="Sub-Admin Permissions"
                  description="Control what data and actions are available to sub-admin users"
                  isDarkMode={isDarkMode}
                >
                  <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                    <SettingToggle
                      label="Allow Manual Points Distribution"
                      description="Sub-admins can manually award points to customers"
                      checked={customerSettings.letSubAdminToGiveManualPoints}
                      onChange={(val) => handleCustomerSettingChange('letSubAdminToGiveManualPoints', val)}
                      isDarkMode={isDarkMode}
                    />
                    <SettingToggle
                      label="Allow Sub-Admins to Claim Rewards"
                      description="Sub-admins can claim rewards on behalf of customers"
                      checked={customerSettings.letSubAdminToClaimRewards}
                      onChange={(val) => handleCustomerSettingChange('letSubAdminToClaimRewards', val)}
                      isDarkMode={isDarkMode}
                    />
                    <SettingToggle
                      label="Show Phone Numbers"
                      description="Display customer phone numbers to sub-admin users"
                      checked={customerSettings.showPhoneNumberOnSubAdmin}
                      onChange={(val) => handleCustomerSettingChange('showPhoneNumberOnSubAdmin', val)}
                      isDarkMode={isDarkMode}
                    />
                    <SettingToggle
                      label="Show Email Addresses"
                      description="Display customer email addresses to sub-admin users"
                      checked={customerSettings.showEmailOnSubAdmin}
                      onChange={(val) => handleCustomerSettingChange('showEmailOnSubAdmin', val)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </SettingsSection>
              )}

              {/* WhatsApp Tab */}
              {activeTab === "whatsapp" && (
                <SettingsSection
                  title="WhatsApp Notifications"
                  description="Configure WhatsApp messaging for reservations and orders"
                  isDarkMode={isDarkMode}
                >
                  <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                    <SettingToggle
                      label="Send WhatsApp on Reservations"
                      description="Automatically send WhatsApp messages when customers make reservations"
                      checked={customerSettings.whatsapp}
                      onChange={(val) => handleCustomerSettingChange('whatsapp', val)}
                      isDarkMode={isDarkMode}
                    />
                    <SettingToggle
                      label="Receive WhatsApp for Orders"
                      description="Get WhatsApp notifications when customers place orders"
                      checked={customerSettings.whatsappOrder}
                      onChange={(val) => handleCustomerSettingChange('whatsappOrder', val)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </SettingsSection>
              )}

              {/* Security Tab (Admin Only) */}
              {activeTab === "security" && user?.role === "admin" && (
                <SettingsSection
                  title="Security Settings"
                  description="Advanced security options for customer verification"
                  isDarkMode={isDarkMode}
                >
                  <div className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                    <SettingToggle
                      label="Require Email OTP"
                      description="Customers must verify their email with a one-time code during login"
                      checked={customerSettings.requireEmailOTP}
                      onChange={(val) => handleCustomerSettingChange('requireEmailOTP', val)}
                      isDarkMode={isDarkMode}
                    />
                    <SettingToggle
                      label="Require Phone OTP"
                      description="Customers must verify their phone number with a one-time SMS code during login"
                      checked={customerSettings.requirePhoneOTP}
                      onChange={(val) => handleCustomerSettingChange('requirePhoneOTP', val)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </SettingsSection>
              )}
            </div>
          </div>
        )}

        {/* No stores message */}
        {stores.length === 0 && (
          <div className={`text-center py-12 rounded-xl shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <Store className={`w-12 h-12 mx-auto mb-3 ${
              isDarkMode ? "text-gray-600" : "text-gray-400"
            }`} />
            <p className={`text-lg font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              No stores found
            </p>
            <p className={`mt-1 text-sm ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}>
              Create a store to access settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Section wrapper - like the "Notification settings" section in the reference
const SettingsSection = ({ title, description, children, isDarkMode }) => {
  return (
    <div>
      <div className="mb-5">
        <h2 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {title}
        </h2>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
};

// Input row matching the reference style - label+description on left, input on right
const SettingInput = ({ label, description, isDarkMode, infoText, tooltipPosition = "bottom", ...inputProps }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b ${
      isDarkMode ? "border-gray-800" : "border-gray-200"
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {label}
          </p>
          {infoText && (
            <div className="relative">
              <Info
                className={`w-4 h-4 cursor-help ${isDarkMode ? "text-gray-500 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className={`absolute z-50 left-0 w-64 p-3 rounded-lg shadow-lg border text-xs ${
                  tooltipPosition === "top" ? "bottom-6" : "top-6"
                } ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white border-gray-200 text-gray-700"
                }`}>
                  {infoText}
                </div>
              )}
            </div>
          )}
        </div>
        <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
          {description}
        </p>
      </div>
      <input
        {...inputProps}
        className={`w-full sm:w-48 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
};

// Toggle row matching the reference style - label+description on left, toggle on right
const SettingToggle = ({ label, description, checked, onChange, isDarkMode, infoText, tooltipPosition = "bottom" }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {label}
          </p>
          {infoText && (
            <div className="relative">
              <Info
                className={`w-4 h-4 cursor-help ${isDarkMode ? "text-gray-500 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              />
              {showTooltip && (
                <div className={`absolute z-50 left-0 w-64 p-3 rounded-lg shadow-lg border text-xs ${
                  tooltipPosition === "top" ? "bottom-6" : "top-6"
                } ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-300"
                    : "bg-white border-gray-200 text-gray-700"
                }`}>
                  {infoText}
                </div>
              )}
            </div>
          )}
        </div>
        <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex shrink-0 items-center h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
          checked
            ? isDarkMode ? "bg-green-500" : "bg-green-600"
            : isDarkMode
              ? "bg-gray-700"
              : "bg-gray-300"
        } ${
          isDarkMode ? "focus:ring-offset-gray-950" : "focus:ring-offset-white"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};
