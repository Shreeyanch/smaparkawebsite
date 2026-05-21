import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing store selection state and operations
 * @param {Object} options - Configuration options
 * @param {boolean} options.persistToLocalStorage - Whether to persist selection to localStorage
 * @param {string} options.localStorageKey - Key for storing store data in localStorage
 * @param {string} options.localStorageIdKey - Key for storing store ID in localStorage
 * @param {boolean} options.fetchOnMount - Whether to fetch stores on component mount
 * @param {Function} options.onStoreChange - Callback when store changes
 */
export const useStoreSelector = ({
  persistToLocalStorage = false,
  localStorageKey = "selectedStoreData",
  localStorageIdKey = "selectedValue",
  fetchOnMount = true,
  onStoreChange = null
} = {}) => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(
    persistToLocalStorage && localStorage.getItem(localStorageKey)
      ? JSON.parse(localStorage.getItem(localStorageKey))
      : null
  );
  const [selectedStoreId, setSelectedStoreId] = useState(
    persistToLocalStorage && localStorage.getItem(localStorageIdKey)
      ? localStorage.getItem(localStorageIdKey)
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [defaultStoreSet, setDefaultStoreSet] = useState(false);

  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  // Fetch stores based on user role
  const fetchStores = async () => {
    if (!fetchOnMount || !token) return;
    
    setLoading(true);
    try {
      const response =
        user?.role === "admin"
          ? await api.get("/store", { headers: { token } })
          : await api.get("/store/myStores", { headers: { token } });

      if (response.data.success) {
        const fetchedStores = response.data.stores || response.data.data || [];
        setStores(fetchedStores);
        
        // Auto-select first store if none selected and user is not admin
        if (!selectedStoreId && user?.role !== "admin" && fetchedStores.length > 0 && !defaultStoreSet) {
          const firstStore = fetchedStores[0];
          handleStoreChange(firstStore._id, firstStore);
          setDefaultStoreSet(true);
        }
      } else {
        toast.error("Error loading stores");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Error loading stores");
    } finally {
      setLoading(false);
    }
  };

  // Handle store selection change
  const handleStoreChange = (storeId, storeData = null) => {
    const store = storeData || stores.find(s => s._id === storeId);
    
    setSelectedStoreId(storeId);
    setSelectedStore(store);

    // Persist to localStorage if enabled
    if (persistToLocalStorage && store) {
      localStorage.setItem(localStorageKey, JSON.stringify(store));
      localStorage.setItem(localStorageIdKey, storeId);
    }

    // Call the provided callback
    if (onStoreChange) {
      onStoreChange(store, storeId);
    }
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedStore(null);
    setSelectedStoreId("");
    
    if (persistToLocalStorage) {
      localStorage.removeItem(localStorageKey);
      localStorage.removeItem(localStorageIdKey);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStores();
    }
  }, [user?.role, fetchOnMount, token]);

  return {
    stores,
    selectedStore,
    selectedStoreId,
    loading,
    handleStoreChange,
    resetSelection,
    refetchStores: fetchStores
  };
};