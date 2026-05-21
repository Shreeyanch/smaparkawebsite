import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/config";
import { toast } from "sonner";
import ProductFilter from "../components/ProductFilter";
import ProductCard from "../components/ProductCard";
import { Search, Plus, Upload, Tags } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import MultiStepForm from "../components/MultiStepForm";
import StoreSelector from "../components/common/StoreSelector";

export default function Products() {
  const { isDarkMode } = useTheme();
  const [storeURL, setStoreURL] = useState("");
  const [page, setPage] = useState(1);
  const [storeId, setStoreId] = useState("");
  const [products, setProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [query, setQuery] = useState("");
  const [productUpdated, setProductUpdated] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState();

  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  // Store selection state 
  const [selectedStoreId, setSelectedStoreId] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  const handleStoreSelection = (storeId) => {
    setSelectedStoreId(storeId);
    setStoreId(storeId);
    setStoreURL(storeId);
    const store = stores.find(s => s._id === storeId);
    setSelectedStore(store);
    localStorage.setItem("selectedValue", storeId);
  };

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response =
          user.role === "admin"
            ? await api.get("/store", { headers: { token } })
            : await api.get("/store/myStores", { headers: { token } });

        if (response.data.success) {
          setStores(response.data.stores);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message, { duration: 2000, theme: "colored" });
      }
    };

    fetchStores();
  }, [token]);

  const fetchStoreProducts = async () => {
    if (!selectedStoreId) return;
    
    try {
      const response = await api.get(`/product/getProducts/${selectedStoreId}`, {
        headers: { token },
      });

      if (response.data.success) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } else {
        toast.error(response.data.message, { duration: 2000 });
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    }
  };

  const fetchCategories = async () => {
    if (!selectedStoreId) return;
    
    try {
      const response = await api.get(
        `/product/categoriesWithProductCount/${selectedStoreId}`,
        {
          headers: { token },
        }
      );

      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories: ", error);
      toast.error("Failed to fetch categories.");
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      fetchStoreProducts();
      fetchCategories();
      setDeliveryCharge();
      setProductUpdated(false);
    }
  }, [productUpdated, selectedStoreId, token]);

  useEffect(() => {
    if (filter) {
      const filtered = products.filter((product) =>
        product.category.includes(filter)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [filter, products]);

  const handleChangeDeliveryCharge = async () => {
    try {
      const response = await api.put(
        `/store/changeDeliveryCharge/${selectedStoreId}`,
        { deliveryCharge },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Delivery charge updated successfully!", {
          duration: 1000,
          // onAutoClose: () => {
          //   window.location.reload();
          // },
        });
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    }
  };

  const handleSaveDescription = () => {
    toast.success("Store description saved!", { duration: 2000 });
  };
  const filteratedProducts = filteredProducts.filter((product) =>
    [product.name].some((field) =>
      field.toLowerCase().includes(query.toLowerCase())
    )
  );

  // Handle edit category
  const handleEditCategory = async (category) => {
    const newCategoryName = prompt(
      "Enter new Category name: ",
      category.categoryName
    );

    if (newCategoryName == null) {
      return;
    }

    if (newCategoryName === category.categoryName) {
      toast.error("Enter correct new category Name");
      return;
    }

    try {
      const response = await api.put(`/product/categories/edit/${selectedStoreId}`, {
        oldCategoryName: category.categoryName,
        newCategoryName,
      });

      if (response.data.status) {
        toast.success("Category updated successfully");
        fetchCategories();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (category) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the category: ${category.categoryName}?`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await api.delete(
        `/product/categories/delete/${selectedStoreId}`,
        {
          data: { categoryName: category.categoryName },
        }
      );

      if (response.data.success) {
        toast.success("Category Deleted Successfully");
        fetchCategories();
        fetchStoreProducts(); // Refresh products as well
      }
    } catch (error) {
      console.error("Error deleting category: ", error);
      toast.error("Failed to delete category");
    }
  };

  // Handle add category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const response = await api.post(
        `/product/addCategory/${selectedStoreId}`,
        {
          categoryName: newCategoryName,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("Category Added Successfully!", { duration: 1000 });
        fetchCategories();
        setNewCategoryName("");
        setIsAddCategoryModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    }
  };

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"
      }`}
    >
      {/* Header Section */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between w-full mb-6 p-4 sm:p-6 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f8fafb] border-gray-200"
        }`}
      >
        {/* Left: Title and Total */}
        <div className="flex flex-col gap-2 mb-4 sm:mb-0">
          <h1
            className={`text-xl sm:text-2xl font-semibold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Products
          </h1>
          <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total: {filteratedProducts ? filteratedProducts.length : 0} products
          </span>
        </div>

        {/* Store Selection */}
        <div className="flex items-center">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreIdChange={handleStoreSelection}
            variant="basic"
            persistToLocalStorage={false}
            customStores={stores}
            fetchOnMount={false}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {selectedStoreId === "" ? (
          <div
            className={`flex justify-center items-center h-64 text-lg rounded-xl shadow-sm border mx-4 sm:mx-6 transition-colors ${
              isDarkMode
                ? "text-gray-400 bg-gray-800 border-gray-700"
                : "text-gray-500 bg-white border-gray-100"
            }`}
          >
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto transition-colors ${
                  isDarkMode ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"
                  />
                </svg>
              </div>
              <p
                className={`text-lg font-medium mb-1 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Select Your Store
              </p>
              <p
                className={`text-sm transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Choose a store to view and manage products
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-6 px-4 sm:px-6 gap-4">
              {/* Left: Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <ProductFilter onFilterChange={setFilter} storeId={selectedStoreId} />

                <div className="flex gap-2 ">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow border-0 flex items-center gap-2"
                    onClick={() => setIsOpen(true)}
                  >
                    <Plus size={16} />
                    <span className="hidden md:block">Add Product</span>

                    <span className="md:hidden sm:block">Add</span>
                  </button>

                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow border flex items-center gap-2 ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => toast.info("Feature coming soon")}
                  >
                    <Upload size={16} />
                    Bulk Add
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow border flex items-center gap-2 ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 bg-gray-900 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setIsCategoriesModalOpen(true);
                      setIsVisible(true);
                    }}
                  >
                    <Tags size={16} />
                    Categories
                  </button>
                </div>
              </div>

              {/* Right: Search Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="relative w-full sm:w-auto">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`w-full sm:w-56 rounded-md pl-9 pr-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-colors ${
                      isDarkMode
                        ? "bg-gray-900 text-white border-gray-600 placeholder-gray-400"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Charge */}
            <div
              className={`rounded-xl shadow-sm mb-6 mx-4 sm:mx-6 transition-colors`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label
                  className={`text-sm font-medium transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Delivery Charge:
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      className={` px-4 py-2 w-32 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        isDarkMode
                          ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      name="deliveryCharge"
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      value={
                        deliveryCharge ||
                        selectedStore?.services
                          .ecommerce.deliveryCharge ||
                        "0"
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    onClick={handleChangeDeliveryCharge}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Product Cards */}
            <div className="px-4 sm:px-6">
              {filteratedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteratedProducts.map((product) => (
                    <div key={product._id}>
                      <ProductCard
                        product={product}
                        setProductUpdated={setProductUpdated}
                        refreshProducts={fetchStoreProducts}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`rounded-xl shadow-sm border p-8 transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                        isDarkMode ? "bg-gray-900" : "bg-gray-100"
                      }`}
                    >
                      <svg
                        className={`w-8 h-8 transition-colors ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <p
                      className={`text-lg font-medium mb-1 transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No products found
                    </p>
                    <p
                      className={`text-sm mb-4 transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Products will appear here when you add them to your store
                    </p>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Your First Product
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isOpen && (
        <MultiStepForm
          onClose={() => setIsOpen(false)}
          refreshProducts={fetchStoreProducts}
        />
      )}

      {/* Categories Modal - Ultra Compact Design */}
      {isCategoriesModalOpen && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
            isVisible ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              setIsCategoriesModalOpen(false);
            }, 300);
          }}
        >
          <div
            className={`rounded-lg w-80 max-h-[80vh] flex flex-col transform transition-transform duration-300 ease-out ${
              isVisible ? "translate-x-0" : "translate-x-full"
            } ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div
              className={`flex items-center justify-between p-3 border-b sticky top-0 z-10 rounded-t-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`flex gap-1.5 items-center text-base font-semibold transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Categories ({categories.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  <Plus size={12} />
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                      setIsCategoriesModalOpen(false);
                    }, 300);
                  }}
                  className={`transition-colors ${
                    isDarkMode
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto p-3"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.length > 0 ? (
                <div className="space-y-1.5">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-2.5 hover:shadow-sm transition-all ${
                        isDarkMode
                          ? "bg-gray-900 border-gray-600 hover:bg-gray-800"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-medium text-sm truncate transition-colors ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                            title={category.categoryName}
                          >
                            {category.categoryName}
                          </h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center text-xs font-semibold transition-colors ${
                                isDarkMode
                                  ? "bg-blue-900 text-blue-300"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {category.noOfProducts}
                            </span>
                            <span
                              className={`text-xs transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              products
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className={`p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
                              isDarkMode
                                ? "text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                                : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            }`}
                            title="Edit Category"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className={`p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
                              isDarkMode
                                ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }`}
                            title="Delete Category"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 mx-auto transition-colors ${
                      isDarkMode ? "bg-gray-900" : "bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-sm font-medium mb-1 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No Categories
                  </h3>
                  <p
                    className={`text-xs mb-3 transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No categories have been created yet.
                  </p>
                  <button
                    onClick={() => setIsAddCategoryModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Categories
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddCategoryModalOpen(false)}
        >
          <div
            className={`rounded-lg max-w-md w-full shadow-xl transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-4 border-b transition-colors ${
                isDarkMode ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Add New Category
              </h3>
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false);
                  setNewCategoryName("");
                }}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <label
                className={`block text-sm font-medium mb-2 transition-colors ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                    : "border-gray-300"
                }`}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  }
                }}
                autoFocus
              />
            </div>

            {/* Modal Footer */}
            <div
              className={`flex justify-end gap-2 p-4  rounded-b-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 bg-gray-900"
                  : "border-gray-200 bg-gray-50"
              }`} 
            >
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false);
                  setNewCategoryName("");
                }}
                className={`px-3 py-1.5 border rounded-md text-sm transition-colors font-medium ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={14} />
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
