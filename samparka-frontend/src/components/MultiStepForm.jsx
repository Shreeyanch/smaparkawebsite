import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, X, Package, Tag, DollarSign, Upload, Image as ImageIcon, Settings } from "lucide-react";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function MultiStepForm({ onClose, refreshProducts }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isStockEnabled, setIsStockEnabled] = useState(false);
  const [specificities, setSpecificities] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const fileInputRef = useRef(null);
  const selected = localStorage.getItem("selectedValue");

  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  // Product States
  const [productName, setProductName] = useState("");
  const [categories, setCategories] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [productPrice, setProductPrice] = useState("");
  const [discountRate, setDiscountRate] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState("");
  const [stocks, setStocks] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDiscountRateChange = (event) => {
    const discount = event.target.value;
    if (discount < 0 || discount >= 100) {
      toast.error("Discount rate must be between 0 and 99", { duration: 200 });
      return;
    }

    setDiscountRate(discount);

    // Calculate the price after discount
    const discountedPrice = productPrice - (productPrice * discount) / 100;
    setCalculatedPrice(discountedPrice.toFixed(2)); // Set the calculated price
  };

  const handleStockToggle = (event) => {
    setIsStockEnabled(event.target.checked);
  };

  const fetchCategory = async () => {
    try {
      const response = await api.get(`/product/getCategoryS/${selected}`, {
        headers: { token },
      });
      if (response.data) {
        setCategories(response.data[0].name);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    }
  };

  const handleAddSpecificity = () => {
    setSpecificities((prevSpecificities) => [
      ...prevSpecificities,
      {
        mainField: "",
        keyValuePairs: [{ key: "", value: "" }],
      },
    ]);
  };

  const handleRemoveSpecificity = (index) => {
    setSpecificities((prevSpecificities) =>
      prevSpecificities.filter((_, i) => i !== index)
    );
  };

  const handleSpecificityChange = (index, field, value) => {
    setSpecificities((prevSpecificities) =>
      prevSpecificities.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      )
    );
  };

  const handleAddKeyValue = (specIndex) => {
    setSpecificities((prevSpecificities) =>
      prevSpecificities.map((spec, i) =>
        i === specIndex
          ? {
              ...spec,
              keyValuePairs: [...spec.keyValuePairs, { key: "", value: "" }],
            }
          : spec
      )
    );
  };

  const handleRemoveKeyValue = (specIndex, pairIndex) => {
    setSpecificities((prevSpecificities) =>
      prevSpecificities.map((spec, i) =>
        i === specIndex
          ? {
              ...spec,
              keyValuePairs: spec.keyValuePairs.filter(
                (_, j) => j !== pairIndex
              ),
            }
          : spec
      )
    );
  };

  const handleKeyValueChange = (specIndex, pairIndex, field, value) => {
    setSpecificities((prevSpecificities) =>
      prevSpecificities.map((spec, i) =>
        i === specIndex
          ? {
              ...spec,
              keyValuePairs: spec.keyValuePairs.map((pair, j) =>
                j === pairIndex ? { ...pair, [field]: value } : pair
              ),
            }
          : spec
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formattedSpecificities = specificities.map((spec) => ({
      mainField: spec.mainField,
      keyValuePairs: spec.keyValuePairs,
    }));

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("description", description);
    formData.append("category", selectedCategory);
    formData.append("storeId", selected);
    formData.append("discountRate", discountRate);
    formData.append("trackStock", isStockEnabled);
    formData.append("calculatedPrice", !calculatedPrice ? productPrice : calculatedPrice);
    images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("stock", stocks);
    
    // Stringify the object before appending
    formData.append("specificity", JSON.stringify(formattedSpecificities));
  
    try {
      const response = await api.post(
        `/product/addProduct/${selected}`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success("Product added successfully!", {
          duration: 1000,
          onAutoClose: () => {
            if (onClose) {
              refreshProducts();
              handleClose();
            }
          }
        });
  
        // Reset form
        setProductName("");
        setProductPrice("");
        setCalculatedPrice("");
        setSelectedCategory("");
        setDiscountRate("");
        setImages([]);
        setStocks("");
        setIsStockEnabled(false);
        setDescription("");
        setSpecificities([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} 
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header - Fixed */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg transition-colors ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`flex gap-2 items-center text-xl font-semibold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Package className="w-5 h-5" />
            Add New Product
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Basic Information */}
            <div>
              <h3 className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Package className="w-5 h-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className={`flex gap-2 items-center text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Tag className="w-4 h-4" />
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.length ? (
                      categories.map((cat, index) => (
                        <option key={index} value={cat}>
                          {cat}
                        </option>
                      ))
                    ) : (
                      <option disabled>No Categories available</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Pricing Information */}
            <div className={`border rounded-lg p-4 transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <DollarSign className="w-5 h-5" />
                Pricing & Discounts
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Price *
                  </label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Discount Rate (%)
                  </label>
                  <input
                    type="number"
                    value={discountRate}
                    onChange={handleDiscountRateChange}
                    min="0"
                    max="99"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {calculatedPrice && (
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Final Price
                  </label>
                  <input
                    type="text"
                    value={`Rs ${calculatedPrice}`}
                    disabled
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-800 text-gray-400' 
                        : 'border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Inventory Management */}
            <div className={`border rounded-lg p-4 transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-medium mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Inventory Management</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isStockEnabled}
                    onChange={handleStockToggle}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500  accent-black"
                  />
                  <span className={`ml-2 text-sm transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Track inventory for this product
                  </span>
                </label>
                
                {isStockEnabled && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={stocks}
                      onChange={(e) => setStocks(e.target.value)}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter stock quantity"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Images */}
            <div>
              <h3 className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <ImageIcon className="w-5 h-5" />
                Product Images
              </h3>
              
              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index}`}
                        className={`w-full h-20 object-cover rounded-lg border transition-colors ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Upload */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-opacity-80 transition-colors cursor-pointer ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`mx-auto h-12 w-12 transition-colors ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <div className="mt-2">
                  <span className={`mt-2 block text-sm font-medium transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Upload Product Images
                  </span>
                  <span className={`mt-1 block text-xs transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    PNG, JPG up to 10MB each
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </div>
            </div>

            {/* Product Specifications */}
            <div className={`border rounded-lg p-4 transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Settings className="w-5 h-5" />
                Product Specifications
              </h3>
              
              {specificities.length > 0 && (
                <div className="space-y-4 mb-4">
                  {specificities.map((spec, specIndex) => (
                    <div key={specIndex} className={`border rounded-lg p-4 transition-colors ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-medium transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Specification {specIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecificity(specIndex)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mb-3">
                        <label className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Specification Name
                        </label>
                        <input
                          type="text"
                          value={spec.mainField}
                          onChange={(e) => handleSpecificityChange(specIndex, "mainField", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="e.g., Color, Size, Material"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={`block text-sm font-medium transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Values
                        </label>
                        {spec.keyValuePairs.map((pair, pairIndex) => (
                          <div key={pairIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={pair.key}
                              onChange={(e) => handleKeyValueChange(specIndex, pairIndex, "key", e.target.value)}
                              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                              placeholder="Key"
                            />
                            <input
                              type="text"
                              value={pair.value}
                              onChange={(e) => handleKeyValueChange(specIndex, pairIndex, "value", e.target.value)}
                              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                              }`}
                              placeholder="Value"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyValue(specIndex, pairIndex)}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddKeyValue(specIndex)}
                          className={`w-full p-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                              : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          Add Value
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddSpecificity}
                className={`w-full p-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'border-green-600 text-green-400 hover:border-green-500 hover:text-green-300' 
                    : 'border-green-300 text-green-600 hover:border-green-400 hover:text-green-700'
                }`}
              >
                <Plus className="w-5 h-5" />
                Add Specification
              </button>
            </div>

            {/* Action Buttons */}
            <div className={`flex justify-end space-x-3 pt-6 border-t transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50 ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
