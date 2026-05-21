import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Search } from 'lucide-react';
import api from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const StoreSelector = ({
  selectedStore,
  selectedStoreId,
  onStoreChange,
  onStoreIdChange,
  placeholder = "Search or select store...",
  variant = "default", // default, styled, basic, custom
  className = "",
  disabled = false,
  required = false,
  showLabel = false,
  labelText = "Store",
  persistToLocalStorage = false,
  localStorageKey = "selectedStoreData",
  localStorageIdKey = "selectedValue",
  fetchOnMount = true,
  customStores = null, // Allow passing stores externally
  style = {} // Additional inline styles
}) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Fetch stores based on user role
  const fetchStores = async () => {
    if (!fetchOnMount || customStores) return;
    
    setLoading(true);
    try {
      const response =
        user?.role === "admin"
          ? await api.get("/store", { headers: { token } })
          : await api.get("/store/myStores", { headers: { token } });

      if (response.data.success) {
        setStores(response.data.stores || response.data.data || []);
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

  useEffect(() => {
    if (token) {
      fetchStores();
    }
  }, [user?.role, fetchOnMount, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use custom stores if provided
  const storeList = useMemo(() => customStores || stores, [customStores, stores]);

  // Filter stores based on search query and sort alphabetically (numeric names at end)
  const filteredStores = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return storeList
      .filter((store) =>
        String(store?.name || "")
          .toLowerCase()
          .includes(normalizedSearch)
      )
      .sort((a, b) => {
        const aName = String(a?.name || "");
        const bName = String(b?.name || "");
        const aStartsWithNumber = /^\d/.test(aName);
        const bStartsWithNumber = /^\d/.test(bName);
        
        // If one starts with number and other doesn't, number goes to end
        if (aStartsWithNumber && !bStartsWithNumber) return 1;
        if (!aStartsWithNumber && bStartsWithNumber) return -1;
        
        // Otherwise, sort alphabetically
        return aName.localeCompare(bName);
      });
  }, [storeList, searchQuery]);

  useEffect(() => {
    if (filteredStores.length === 0) {
      setHighlightedIndex(-1);
      return;
    }

    if (highlightedIndex >= filteredStores.length) {
      setHighlightedIndex(filteredStores.length - 1);
    }
  }, [filteredStores, highlightedIndex]);

  // Handle store selection
  const handleSelectStore = (store) => {
    // Call the provided change handlers
    if (onStoreIdChange) {
      onStoreIdChange(store._id);
    }
    
    if (onStoreChange) {
      onStoreChange(store);
    }

    // Persist to localStorage if enabled
    if (persistToLocalStorage) {
      localStorage.setItem(localStorageKey, JSON.stringify(store));
      localStorage.setItem(localStorageIdKey, store._id);
    }

    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredStores.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredStores[highlightedIndex]) {
          handleSelectStore(filteredStores[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Get the current selected store name
  const currentStoreName = selectedStore?.name || 
    storeList.find(s => s._id === selectedStoreId)?.name || "";

  // Get variant-specific styles
  const getInputStyles = () => {
    const baseStyles = `w-full px-3 py-2 pl-9 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors text-sm ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`;

    switch (variant) {
      case "styled":
        return `${baseStyles} lg:text-base ${
          isDarkMode 
            ? 'bg-gray-900 text-gray-200 border-gray-800' 
            : 'bg-white text-gray-700 border-gray-200'
        }`;

      case "basic":
        return `${baseStyles} ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        }`;

      case "custom":
        return className || baseStyles;

      default:
        return `${baseStyles} ${
          isDarkMode
            ? "bg-gray-800 text-gray-200 border-gray-600"
            : "bg-white text-gray-700 border-gray-200"
        }`;
    }
  };

  const getDropdownStyles = () => {
    return `absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-auto ${
      isDarkMode
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200"
    }`;
  };

  const getOptionStyles = (isHighlighted, isSelected) => {
    let styles = "px-3 py-2 cursor-pointer transition-colors flex items-center gap-2";
    
    if (isSelected) {
      styles += isDarkMode
        ? " bg-green-900/30 text-green-400"
        : " bg-green-50 text-green-700";
    } else if (isHighlighted) {
      styles += isDarkMode
        ? " bg-gray-700"
        : " bg-gray-100";
    }

    return styles;
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {showLabel && (
        <label
          className={`block text-sm font-medium mb-2 transition-colors ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {labelText}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Field */}
      <div className="relative">
        <Search 
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`} 
        />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : currentStoreName}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Loading stores..." : placeholder}
          className={getInputStyles()}
          style={style}
          disabled={disabled || loading}
          required={required}
        />
        
        {/* Dropdown Icon */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            } ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className={getDropdownStyles()} ref={listRef}>
          {loading ? (
            <div className={`px-3 py-4 text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              Loading stores...
            </div>
          ) : filteredStores.length === 0 ? (
            <div className={`px-3 py-4 text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {searchQuery ? "No stores found" : "No stores available"}
            </div>
          ) : (
            filteredStores.map((store, index) => {
              const isSelected = store._id === (selectedStoreId || selectedStore?._id);
              const isHighlighted = index === highlightedIndex;
              
              return (
                <div
                  key={store._id}
                  onClick={() => handleSelectStore(store)}
                  className={getOptionStyles(isHighlighted, isSelected)}
                >
                  <span className="flex-1 truncate">{store.name}</span>
                  {isSelected && (
                    <span className="text-green-500 text-xs">✓</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StoreSelector;
