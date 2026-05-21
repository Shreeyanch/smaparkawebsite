import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Edit, Trash2 } from "lucide-react";
import { Switch } from "@mui/material";

// eslint-disable-next-line react/prop-types
const ProductCard = ({ product, setProductUpdated, refreshProducts }) => {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const [isStockEnabled, setIsStockEnabled] = useState(product.trackStock);
  const [formData, setFormData] = useState({
    _id: product._id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    discountRate: product.discountRate || 0,
    calculatedPrice: product.calculatedPrice || product.price,
    images: [...product.images], // Store existing images
    trackStock: product.trackStock,
    stock: product.stock,
  });

  const [previewImages, setPreviewImages] = useState([...product.images]);
  const [removedImages, setRemovedImages] = useState([]);
  const stockInputRef = useRef(null);
  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await api.delete(`/product/delete/${product._id}`, {
        headers: { token },
      });

      if (response.status === 200) {
        toast.success(`"${product.name}" deleted successfully!`);
        refreshProducts();
        setDeleteModalOpen(false);
        handleCloseModal(); // Close the edit modal after deletion
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  // Handle animated modal close
  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Handle discount rate change
  const handleDiscountRateChange = (event) => {
    const discount = event.target.value;
    if (discount < 0 || discount > 100) {
      toast.error("Discount rate must be between 0 and 100", {
        autoClose: 2000,
      });
      return;
    }

    const discountedPrice = formData.price - (formData.price * discount) / 100;
    setFormData({
      ...formData,
      discountRate: discount,
      calculatedPrice: discountedPrice.toFixed(2),
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map((file) => URL.createObjectURL(file));

    setFormData({
      ...formData,
      images: [...formData.images, ...files],
    });
    setPreviewImages([...previewImages, ...newImagePreviews]);
  };

  // Remove image
  const handleRemoveImage = (index) => {
    const removedImage = formData.images[index];
    setRemovedImages((prev) => [...prev, removedImage.name || removedImage]);

    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);

    setFormData({ ...formData, images: updatedImages });
    setPreviewImages(updatedPreviews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("price", formData.price);
    form.append("calculatedPrice", formData.calculatedPrice);
    form.append("discountRate", formData.discountRate);
    form.append("trackStock", formData.trackStock);
    form.append("stock", formData.stock);

    formData.images.forEach((file) => form.append("images", file));
    form.append("removedImages", JSON.stringify(removedImages));

    try {
      const response = await api.put(`/product/update/${product._id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          token,
        },
      });

      if (response.data) {
        toast.success("Product updated successfully!");
        setProductUpdated(true);
        refreshProducts();
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { autoClose: 2000, theme: "colored" });
    }
  };

  // Recalculate calculatedPrice whenever price or discountRate changes
  useEffect(() => {
    const discountedPrice =
      formData.price - (formData.price * formData.discountRate) / 100;
    setFormData((prevData) => ({
      ...prevData,
      calculatedPrice: discountedPrice.toFixed(2),
    }));
  }, [formData.price, formData.discountRate]);

  const handleStockToggle = (event) => {
    const updatedTrackStock = event.target.checked;
    setIsStockEnabled(updatedTrackStock); // Update isStockEnabled
    setFormData({
      ...formData,
      trackStock: updatedTrackStock, // Update formData.trackStock as well
      stock: updatedTrackStock ? formData.stock || 0 : null, // Set stock to null if trackStock is false
    });

    if (updatedTrackStock && stockInputRef.current) {
      stockInputRef.current.focus();
    }
  };

  return (
    <>
      {/* Product Card */}
      <div className={`rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Product Image */}
        <div className={`p-4 relative overflow-hidden ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          />

        </div>

        {/* Product Content */}
        <div className="px-4 py-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Product Name */}
              <h3 className={`font-medium text-base mb-1 line-clamp-2 leading-5 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name}
              </h3>

              {/* Product Description */}
              {/* <p className="text-gray-500 text-sm mb-3">
                {product.description ? product.description.substring(0, 40) + (product.description.length > 40 ? "..." : "") : "Product"}
              </p> */}

              {/* Price Section */}
              <div className="flex items-center gap-2 mb-3">
                {product.discountRate > 0 ? (
                  <>
                    <span className={`text-sm font-medium transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Rs{product.calculatedPrice}
                    </span>
                    <span className={`text-sm line-through transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Rs{product.price}
                    </span>
                  </>
                ) : (
                  <span className={`text-sm font-medium transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Rs{product.calculatedPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setOpen(true)}
              className={`flex justify-center items-center w-10 h-10 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Edit className={`w-4 h-4 transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`} />
            </button>
          </div>

          {/* Stock Information */}
          <div className={`flex items-center justify-between gap-8 py-4 border-t transition-colors ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            {product.trackStock && (
              <div className="flex gap-2">
                {product.stock > 0 ? <span className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Stock:</span> : <span></span>}

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

                  {product.stock === 0 ? <span className="text-red-500 text-sm font-medium">Sold out</span> : <span className="text-green-500 text-sm font-medium">{product.stock} units</span>}
                </div>
              </div>
            )
            }

            {product.discountRate > 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Discount:</span>
                <span className="text-green-500 text-sm font-medium"> {product.discountRate}%</span>

              </div>
            )}
          </div>




        </div>
      </div>

      {/* Edit Modal - Modern Design with Slide Animation */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className={`rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out shadow-2xl ${
              isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
            } ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-xl transition-colors ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-900' 
                : 'border-gray-200 bg-white'
            }`}>
              <h2 className={`flex gap-2 items-center text-xl font-semibold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Edit Product
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={openDeleteModal}
                  className={`transition-colors p-2 rounded-lg ${
                    isDarkMode 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                      : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={handleCloseModal}
                  className={`transition-colors p-2 rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter price"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter product description"
                  />
                </div>

                {/* Pricing */}
                <div className={`border rounded-lg p-4 transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-4 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Pricing & Discounts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Discount Rate (%)
                      </label>
                      <input
                        type="number"
                        name="discountRate"
                        value={formData.discountRate}
                        onChange={handleDiscountRateChange}
                        min="0"
                        max="100"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Final Price
                      </label>
                      <input
                        type="text"
                        value={`Rs ${formData.calculatedPrice}`}
                        disabled
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-600 text-gray-300' 
                            : 'border-gray-300 bg-gray-50 text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory Management */}
                <div className={`border rounded-lg p-4 transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-4 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Inventory Management</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.trackStock}
                        onChange={handleStockToggle}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 accent-black"
                      />
                      <span className={`ml-2 text-sm transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Track inventory for this product
                      </span>
                    </label>
                    
                    {formData.trackStock && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          ref={stockInputRef}
                          min="0"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'border-gray-300'
                          }`}
                          placeholder="Enter stock quantity"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Images */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Product Images</h3>
                  
                  {/* Image Preview Grid */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {previewImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index}`}
                            className={`w-full h-28 object-cover rounded-lg border transition-colors ${
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
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => document.querySelector('input[type="file"]').click()}
                  >
                    <svg className={`mx-auto h-12 w-12 transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="mt-2">
                      <span className={`mt-2 block text-sm font-medium transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Add More Images
                      </span>
                      <span className={`mt-1 block text-xs transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        PNG, JPG up to 10MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex justify-end space-x-3 pt-6 border-t transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-900' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Minimal Design */}
      {deleteModalOpen && (
        <div 
          className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 ${
            deleteModalOpen ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div 
            className={`rounded-xl max-w-sm w-full transform transition-transform duration-300 ease-out shadow-2xl ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Content */}
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkMode ? 'bg-red-900/20' : 'bg-red-100'
              }`}>
                <Trash2 className={`w-8 h-8 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Delete Product?</h3>
              <p className={`text-sm mb-6 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                This will permanently delete <span className={`font-medium transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>"{product.name}"</span>
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors disabled:opacity-50 ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-900' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ProductCard;