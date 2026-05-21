import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import api from "../api/config";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ProductFilter = ({ onFilterChange, storeId }) => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setCategories([]); // Reset categories when storeId changes
    setSelectedCategory(""); // Reset selected category

    if (storeId) {
      const fetchCategoryOptions = async () => {
        try {
          const response = await api.get(`/product/getCategoryS/${storeId}`, {
            headers: { token },
          });

          // Ensure response is an array and correctly map the category names
          if (response.data && Array.isArray(response.data)) {
            setCategories(response?.data[0]?.name || []);
          }
        } catch (error) {
          console.error(error);
          toast.error(error.message, { autoClose: 2000, theme: "colored" });
        }
      };

      fetchCategoryOptions();
    }
  }, [storeId]);

  const handleFilterChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    onFilterChange(category);
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 text-sm transition-colors ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <Filter className="w-4 h-4" />
        <span>Category:</span>
      </div>
      <select
        value={selectedCategory}
        onChange={handleFilterChange}
        className={`px-3 py-2 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm min-w-[140px] appearance-none bg-no-repeat bg-[position:right_12px_center] transition-colors ${
          isDarkMode 
            ? 'bg-gray-900 text-white border-gray-600' 
            : 'bg-white text-gray-700 border-gray-200'
        }`}
        style={{ 
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iJHtpc0RhcmtNb2RlID8gJyNEMUQ1REInIDogJyM2QjcyODAnfSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')`,
          backgroundSize: '12px' 
        }}
      >
        <option value="">All Categories</option>
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))
        ) : (
          <option disabled>No categories available</option>
        )}
      </select>
    </div>
  );
};

export default ProductFilter;
