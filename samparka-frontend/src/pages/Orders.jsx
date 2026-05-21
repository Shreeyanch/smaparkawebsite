import { useEffect, useState } from "react";
import api from "../api/config";
import { toast } from "sonner";
import EditComponent from "../components/EditComponent";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Dialog,
  DialogContent,
} from "@mui/material";
import { EllipsisVertical, Printer, X, Eye, Pencil, Trash2 } from "lucide-react";
import OrderModal from "../components/OpenModal";
import StoreSelector from "../components/common/StoreSelector";

export default function Orders() {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const [stores, setStores] = useState([]);
  const [editOrder, setEditOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [rows, setRows] = useState([]);
  const [fullResponse, setFullResponse] = useState([]);
  const [storeId, setStoreId] = useState(selected || "");
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);


  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // New state for image modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // New state for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const handleMenuOpen = (event, orderId) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === orderId ? null : orderId);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setDropdownOpen(null);
    setSelectedOrderId(null);
  };

  const handleOpen = (products, orderInfo) => {
    setSelectedOrderProducts(products);
    setSelectedOrderInfo(orderInfo);
    setOpen(true);
    setProductsDialogOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  // Image modal handlers
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside any dropdown
      const dropdownContainers = document.querySelectorAll('.dropdown-container');
      let isOutside = true;
      
      dropdownContainers.forEach(container => {
        if (container.contains(event.target)) {
          isOutside = false;
        }
      });
      
      if (isOutside) {
        setDropdownOpen(null);
      }
    };

    if (dropdownOpen) {
      // Use setTimeout to avoid immediate closure when opening
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleImageModalClose = () => {
    setImageModalOpen(false);
  };

  const handlePrintImage = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Print Image</title></head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <img src="${selectedImage}" style="max-width: 100%; max-height: 100%;" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/order/status/${orderToDelete._id}`, {
        headers: { token },
      });

      toast.success("Order deleted successfully!");

      // Refetch orders to update pagination correctly
      const response = await api.get(`/order/${selected}?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: { token },
      });
      
      if (response.data.success) {
        // If current page is empty and not the first page, go to previous page
        if (response.data.orders.length === 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          setOrders(response.data.orders);
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
            setTotalOrders(response.data.pagination.totalOrders);
          }
          
          const mappedRows = response.data.orders.map((order) => {
            const calculateTotal = (products) => {
              if (!products || !Array.isArray(products)) return 0;
              let subTotal = 0;
              products.forEach(product => {
                const productTotal = parseFloat(product.productTotalPrice) || 
                                   (parseFloat(product.productPrice || product.price) * parseInt(product.productQuantity || product.quantity)) || 
                                   0;
                subTotal += productTotal;
              });
              return subTotal;
            };

            const calculatedTotal = calculateTotal(order.products);

            const formatDate = (dateString) => {
              const date = new Date(dateString);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (date.toDateString() === today.toDateString()) {
                return 'Today';
              } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
              } else {
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            };

            return {
              id: order._id.slice(-5),
              userName: order.userName,
              userPhone: order.userPhone,
              userAddress: order.userAddress,
              image: order.image,
              orderDate: formatDate(order.orderDate),
              rawDate: order.orderDate,
              products: order.products,
              status: order.status,
              total: order.total || calculatedTotal,
            };
          });
          
          setFullResponse(response.data.orders);
          setRows(mappedRows);
        }
      }

      setDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Pagination calculations for display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + rows.length, totalOrders);
  
  // For display purposes
  const currentRows = rows;

  useEffect(() => {
    localStorage.setItem("selectedValue", selected);
  }, [selected]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get(`/order/${selected}?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: { token },
        });
        if (response.data.success) {
          setOrders(response.data.orders);
          
          // Update pagination metadata from backend
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
            setTotalOrders(response.data.pagination.totalOrders);
          } else {
            // Fallback if pagination data is missing
            setTotalPages(1);
            setTotalOrders(response.data.orders.length);
          }
          
          // Debug: Log the first order to see the structure
          if (response.data.orders.length > 0) {
          }

          const mappedRows = response.data.orders.map((order) => {
            // Calculate total from products using the same logic as OpenModal
            const calculateTotal = (products) => {
              if (!products || !Array.isArray(products)) return 0;
              let subTotal = 0;
              products.forEach(product => {
                // Use the same field names as OpenModal.jsx
                const productTotal = parseFloat(product.productTotalPrice) || 
                                   (parseFloat(product.productPrice || product.price) * parseInt(product.productQuantity || product.quantity)) || 
                                   0;
                subTotal += productTotal;
              });
              return subTotal;
            };

            const calculatedTotal = calculateTotal(order.products);

            // Format date in a more minimal way
            const formatDate = (dateString) => {
              const date = new Date(dateString);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (date.toDateString() === today.toDateString()) {
                return 'Today';
              } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
              } else {
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            };

            return {
              id: order._id.slice(-5),
              userName: order.userName,
              userPhone: order.userPhone,
              userAddress: order.userAddress,
              image: order.image,
              orderDate: formatDate(order.orderDate),
              rawDate: order.orderDate,
              products: order.products,
              status: order.status,
              total: order.total || calculatedTotal,
            };
          });
          setFullResponse(response.data.orders);
          setRows(mappedRows);
          // Moved this here to make sure orders is set first
        } else {
          toast.error(response.data.message, { duration: 2000 });
          setOrders([]);
          setRows([]);
          setTotalPages(0);
          setTotalOrders(0);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message, { duration: 2000 });
        setOrders([]);
        setRows([]);
        setTotalPages(0);
        setTotalOrders(0);
      }
    };
    if(selected){

      fetchOrders();
    }
  }, [storeId, selected, currentPage, itemsPerPage]);

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

  const handleOrderAction = async (orderId, action) => {
    try {

      const orderToEdit = orders.find(
        (order) => order._id.slice(-5) === orderId
      );

      if (!orderToEdit) {
        console.error("No matching order found!");
        toast.error("Order not found.");
        return;
      }

      if (action === "editProducts") {
        setEditOrder(orderToEdit);
        handleMenuClose();
        return;
      }

      if (action === "delete") {
        // Open delete confirmation modal instead of alert
        setOrderToDelete(orderToEdit);
        setDeleteModalOpen(true);
        handleMenuClose();
        return;
      }

      let status = "";
      switch (action) {
        case "paid":
          status = "paid";
          break;
        case "pending":
          status = "pending";
          break;
        case "decline":
          status = "failed";
          break;
        default:
          return;
      }

      const response = await api.put(
        `/order/status/${storeId}`,
        { orderId: orderToEdit._id, status },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`Order ${action} successfully!`);

        // Update both orders and rows states
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderToEdit._id ? { ...order, status } : order
          )
        );

        setRows((prevRows) =>
          prevRows.map((row) => (row.id === orderId ? { ...row, status } : row))
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className={`min-h-screen sm:ml-64 transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Orders</h1>
              <p className={`text-sm mt-1 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Manage and track all orders</p>
            </div>
            <div className="flex items-center gap-4">
              <StoreSelector
                selectedStoreId={selected}
                onStoreIdChange={(storeId) => {
                  setStoreId(storeId);
                  setSelected(storeId);
                }}
                variant="default"
                customStores={stores}
                fetchOnMount={false}
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {selected && rows.length > 0 ? (
          <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`border-b transition-colors ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-50'
                    }`}>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Order
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Customer
                      </th>
                      
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Addressod
                      </th>
                      
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Date
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Status
                      </th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Items
                      </th>
                      
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Total
                      </th>
                      <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-50'
                  }`}>
                    {currentRows.map((order, index) => (
                      <tr key={order.id} className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-25'
                      }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {order.image ? (
                              <img
                                src={order.image}
                                alt="Order"
                                className={`w-10 h-10 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border ${
                                  isDarkMode ? 'border-gray-600' : 'border-gray-100'
                                }`}
                                onClick={() => handleImageClick(order.image)}
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                                isDarkMode 
                                  ? 'bg-gray-700 border-gray-600' 
                                  : 'bg-gray-50 border-gray-100'
                              }`}>
                                <svg className={`w-4 h-4 transition-colors ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <div className={`text-sm font-semibold transition-colors ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>#{order.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className={`text-sm font-medium transition-colors ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{order.userName}</div>
                            <div className={`text-xs mt-0.5 transition-colors ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>{order.userPhone}</div>
                          </div>
                        </td>

                        <td className={`px-6 py-4 w-16 transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                              {order.userAddress}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm transition-colors ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>{order.orderDate}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.status.toLowerCase() === 'paid' 
                              ? isDarkMode 
                                ? 'bg-emerald-900/20 text-emerald-400 ring-1 ring-emerald-800/50'
                                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : order.status.toLowerCase() === 'pending'
                              ? isDarkMode
                                ? 'bg-amber-900/20 text-amber-400 ring-1 ring-amber-800/50'
                                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                              : order.status.toLowerCase() === 'sent for delivery'
                              ? isDarkMode
                                ? 'bg-blue-900/20 text-blue-400 ring-1 ring-blue-800/50'
                                : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              : order.status.toLowerCase() === 'completed'
                              ? isDarkMode
                                ? 'bg-green-900/20 text-green-400 ring-1 ring-green-800/50'
                                : 'bg-green-50 text-green-700 ring-1 ring-green-200'
                              : order.status.toLowerCase() === 'processing'
                              ? isDarkMode
                                ? 'bg-blue-900/20 text-blue-400 ring-1 ring-blue-800/50'
                                : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              : order.status.toLowerCase() === 'shipped'
                              ? isDarkMode
                                ? 'bg-blue-900/20 text-blue-400 ring-1 ring-blue-800/50'
                                : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              : order.status.toLowerCase() === 'failed' || order.status.toLowerCase() === 'declined'
                              ? isDarkMode
                                ? 'bg-red-900/20 text-red-400 ring-1 ring-red-800/50'
                                : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                              : isDarkMode
                                ? 'bg-gray-800 text-gray-400 ring-1 ring-gray-700'
                                : 'bg-gray-50 text-gray-700 ring-1 ring-gray-200'
                          }`}>
                            {order.status.toLowerCase() === 'paid' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {order.status.toLowerCase() === 'pending' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {order.status.toLowerCase() === 'sent for delivery' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            )}
                            {order.status.toLowerCase() === 'completed' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {(order.status.toLowerCase() === 'processing' || order.status.toLowerCase() === 'shipped') && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                            {(order.status.toLowerCase() === 'failed' || order.status.toLowerCase() === 'declined') && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 text-sm transition-colors ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold border transition-colors ${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-300 border-gray-600' 
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {order.products.length}
                            </span>
                            items
                          </div>
                        </td>
                      
                        <td className="px-6 py-4">
                          <div className={`text-sm font-semibold transition-colors ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            NPR {isNaN(Number(order.total)) ? '0' : Number(order.total).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="relative dropdown-container flex items-center justify-center gap-2">
                            {/* Eye Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpen(order.products, order);
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                              }`}
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            
                            {/* 3-Dot Menu */}
                            <EllipsisVertical
                              className={`h-6 w-6 cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                              onClick={(e) => handleMenuOpen(e, order.id)}
                            />
                            {dropdownOpen === order.id && (
                              <div 
                                className={`absolute right-0 mt-2 w-56 border rounded-xl shadow-xl z-10 overflow-hidden ${
                                  isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Edit Order */}
                                <button
                                  onClick={() => {
                                    handleOrderAction(order.id, "editProducts");
                                    setDropdownOpen(null);
                                  }}
                                  className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-800 border-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50 border-gray-100'
                                  }`}
                                >
                                  <Pencil className={`h-4 w-4 mr-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                  <span className="font-medium">Edit Order</span>
                                </button>
                                
                                {/* Delete Order */}
                                <button
                                  onClick={() => {
                                    handleOrderAction(order.id, "delete");
                                    setDropdownOpen(null);
                                  }}
                                  className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-800' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <Trash2 className={`h-4 w-4 mr-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                  <span className="font-medium">Delete Order</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Accordion View (visible on mobile) */}
            <div className="lg:hidden mx-4 sm:mx-6">
              {currentRows.length > 0 ? (
                <div className="space-y-2">
                  {currentRows.map((order, index) => {
                    const isExpanded = expandedRows.includes(order.id);
                    return (
                      <div key={order.id} className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
                        isDarkMode ? 'bg-gray-900' : 'bg-white'
                      } ${
                        isExpanded 
                          ? isDarkMode 
                            ? 'border-green-600 shadow-lg shadow-green-900/20 ring-1 ring-green-600/30' 
                            : 'border-green-300 shadow-lg shadow-green-100 ring-1 ring-green-200'
                          : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        {/* Accordion Header - Always Visible */}
                        <button
                          onClick={() => {
                            setExpandedRows(prev => 
                              prev.includes(order.id) 
                                ? [] // Close if already open
                                : [order.id] // Open only this one, close others
                            )
                          }}
                          className={`w-full px-4 py-3 flex items-center justify-between transition-colors focus:outline-none ${
                            isExpanded 
                              ? isDarkMode 
                                ? 'bg-green-900/30 hover:bg-green-900/40' 
                                : 'bg-green-50 hover:bg-green-100'
                              : isDarkMode ? 'hover:bg-gray-800 focus:bg-gray-700' : 'hover:bg-gray-50 focus:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            {/* Order Image/Icon */}
                            <div className="flex-shrink-0">
                              {order.image ? (
                                <img
                                  src={order.image}
                                  alt="Order"
                                  className={`w-8 h-8 object-cover rounded-lg border ${
                                    isDarkMode ? 'border-gray-600' : 'border-gray-100'
                                  }`}
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600' 
                                    : 'bg-gray-100 border-gray-100'
                                }`}>
                                  <svg className={`w-4 h-4 transition-colors ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {/* Order Info */}
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className={`font-medium text-sm transition-colors ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{order.userName}</h3>
                                  <p className={`text-xs mt-0.5 transition-colors ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>#{order.id}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status.toLowerCase() === 'paid' 
                                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                      : order.status.toLowerCase() === 'pending'
                                      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                      : order.status.toLowerCase() === 'sent for delivery'
                                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                      : order.status.toLowerCase() === 'completed'
                                      ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                      : order.status.toLowerCase() === 'processing'
                                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                      : order.status.toLowerCase() === 'shipped'
                                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                      : order.status.toLowerCase() === 'failed' || order.status.toLowerCase() === 'declined'
                                      ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                      : 'bg-gray-50 text-gray-700 ring-1 ring-gray-200'
                                  }`}>
                                    {order.status.toLowerCase() === 'paid' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {order.status.toLowerCase() === 'pending' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                    {order.status.toLowerCase() === 'sent for delivery' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                      </svg>
                                    )}
                                    {order.status.toLowerCase() === 'completed' && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                    {(order.status.toLowerCase() === 'processing' || order.status.toLowerCase() === 'shipped') && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                    )}
                                    {(order.status.toLowerCase() === 'failed' || order.status.toLowerCase() === 'declined') && (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                  <span className={`text-sm font-semibold transition-colors ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>NPR {isNaN(Number(order.total)) ? '0' : Number(order.total).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expand/Collapse Icon */}
                          <svg 
                            className={`w-5 h-5 transition-all duration-200 ${
                              isExpanded 
                                ? isDarkMode ? 'rotate-180 text-green-400' : 'rotate-180 text-green-600'
                                : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Accordion Content - Expandable */}
                        {isExpanded && (
                          <div className={`px-4 pb-4 border-t transition-colors ${
                            isDarkMode 
                              ? 'border-green-600 bg-transparent' 
                              : 'border-green-200 bg-gradient-to-b from-green-25 to-white'
                          }`}>
                            <div className="space-y-3 pt-3">
                              {/* Phone */}
                              <div className="flex items-center space-x-3">
                                <svg className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs mb-1 transition-colors ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>Phone</p>
                                  <p className={`text-sm transition-colors ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                  }`}>{order.userPhone}</p>
                                </div>
                              </div>
                              
                              {/* Date */}
                              <div className="flex items-center space-x-3">
                                <svg className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs mb-1 transition-colors ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>Date</p>
                                  <p className={`text-sm transition-colors ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                  }`}>{order.orderDate}</p>
                                </div>
                              </div>

                              {/* Address */}
                              <div className="flex items-center space-x-3">
                                <svg className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs mb-1 transition-colors ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>Address</p>
                                  <p className={`text-sm truncate transition-colors ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                  }`}>{order.userAddress}</p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className={`flex justify-between items-center pt-3 border-t transition-colors ${
                                isDarkMode ? 'border-green-600' : 'border-green-200'
                              }`}>
                                <div className="flex items-center gap-3">
                                  {/* View Details Icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpen(order.products, order);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                      isDarkMode 
                                        ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 hover:text-blue-300' 
                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                                    }`}
                                    title="View Details"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>

                                  {/* Edit Order Icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOrderAction(order.id, "editProducts");
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                      isDarkMode 
                                        ? 'bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 hover:text-amber-300' 
                                        : 'bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700'
                                    }`}
                                    title="Edit Order"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>

                                  {/* Delete Order Icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOrderAction(order.id, "delete");
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                      isDarkMode 
                                        ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300' 
                                        : 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700'
                                    }`}
                                    title="Delete Order"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>

                                  {/* Items Count Badge */}
                                  <div className={`flex items-center gap-1 text-xs transition-colors ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-semibold transition-colors ${
                                      isDarkMode 
                                        ? 'bg-gray-700 text-gray-300' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {order.products.length}
                                    </span>
                                    items
                                  </div>
                                </div>
                                
                                <div className="relative dropdown-container">
                                  <EllipsisVertical
                                    className={`h-6 w-6 cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuOpen(e, order.id);
                                    }}
                                  />
                                  {dropdownOpen === order.id && (
                                    <div 
                                      className={`absolute right-0 mt-2 w-56 border rounded-xl shadow-xl z-10 overflow-hidden ${
                                        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                                      }`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Edit Order */}
                                      <button
                                        onClick={() => {
                                          handleOrderAction(order.id, "editProducts");
                                          setDropdownOpen(null);
                                        }}
                                        className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${
                                          isDarkMode 
                                            ? 'text-gray-300 hover:bg-gray-800 border-gray-700' 
                                            : 'text-gray-700 hover:bg-gray-50 border-gray-100'
                                        }`}
                                      >
                                        <Pencil className={`h-4 w-4 mr-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <span className="font-medium">Edit Order</span>
                                      </button>
                                      
                                      {/* Delete Order */}
                                      <button
                                        onClick={() => {
                                          handleOrderAction(order.id, "delete");
                                          setDropdownOpen(null);
                                        }}
                                        className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors ${
                                          isDarkMode 
                                            ? 'text-gray-300 hover:bg-gray-800' 
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        <Trash2 className={`h-4 w-4 mr-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <span className="font-medium">Delete Order</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`rounded-xl shadow-sm border p-8 ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>No orders found</p>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>No orders have been placed for this store yet.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className={`px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700 text-gray-300' 
                : 'bg-gray-25 border-gray-50 text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-medium">Rows per page:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className={`border-none rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-200' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="font-medium text-center sm:text-left">
                  {totalOrders === 0 ? '0-0 of 0' : `${startIndex + 1}-${endIndex} of ${totalOrders}`}
                </span>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1 || totalPages === 0}
                    className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-green-600 text-white'
                              : isDarkMode
                              ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : selected ? (
          <div className={`rounded-xl shadow-sm border p-12 text-center transition-colors ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`mb-4 transition-colors ${
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>No Orders Found</h3>
            <p className={`text-sm transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>No orders have been placed for this store yet.</p>
          </div>
        ) : (
          <div className={`rounded-xl shadow-sm border p-12 text-center transition-colors ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className={`mb-4 transition-colors ${
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v9.5" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Select a Store</h3>
            <p className={`text-sm transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Please select a store to view its orders.</p>
          </div>
        )}

        {/* Image Modal */}
        <Dialog
          open={imageModalOpen}
          onClose={handleImageModalClose}
          maxWidth="md"
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? "#1f2937" : "#ffffff",
              color: isDarkMode ? "#f3f4f6" : "#111827",
              borderRadius: 3,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
          }}
        >
          <DialogContent sx={{ position: "relative", p: 0 }}>
            <button
              onClick={handleImageModalClose}
              className={`absolute right-4 top-4 z-10 p-2 rounded-full shadow-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-900 bg-opacity-90 hover:bg-opacity-100' 
                  : 'bg-white bg-opacity-90 hover:bg-opacity-100'
              }`}
            >
              <X size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>

            <button
              onClick={handlePrintImage}
              className={`absolute right-4 top-16 z-10 p-2 rounded-full shadow-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-900 bg-opacity-90 hover:bg-opacity-100' 
                  : 'bg-white bg-opacity-90 hover:bg-opacity-100'
              }`}
            >
              <Printer size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>

            {selectedImage && (
              <img
                src={selectedImage}
                alt="Order"
                className="max-w-full max-h-[80vh] block mx-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>

        <OrderModal
          open={open}
          handleClose={handleClose}
          selectedOrderProducts={selectedOrderProducts}
          orderInfo={selectedOrderInfo}
          onEditOrder={(orderInfo) => {
            // Find the full order object from the orders array using the order ID
            const fullOrder = orders.find(order => order._id.slice(-5) === orderInfo.id);
            if (fullOrder) {
              setEditOrder(fullOrder);
            }
          }}
        />

        {/* Expanded Products List */}
        {editOrder && (
          <EditComponent 
            order={editOrder} 
            storeId={storeId}
            onClose={() => setEditOrder(null)}
            onOrderUpdated={(updatedOrder) => {
              // Update the orders state with the updated order
              setOrders(prevOrders =>
                prevOrders.map(order =>
                  order._id === updatedOrder._id ? updatedOrder : order
                )
              );
              // Update the rows state as well
              setRows(prevRows =>
                prevRows.map(row => {
                  if (row.id === updatedOrder._id.slice(-5)) {
                    return {
                      ...row,
                      status: updatedOrder.status,
                      userName: updatedOrder.userName,
                      userPhone: updatedOrder.userPhone,
                      userAddress: updatedOrder.userAddress,
                      total: isNaN(parseFloat(updatedOrder.total)) ? row.total : parseFloat(updatedOrder.total)
                    };
                  }
                  return row;
                })
              );
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleDeleteCancel}
          >
            <div 
              className={`rounded-2xl shadow-2xl w-full max-w-md ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`flex items-center justify-between p-6 pb-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Delete Order</h2>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Are you sure you want to delete order <span className="font-semibold">#{orderToDelete?._id.slice(-5)}</span> for <span className="font-semibold">{orderToDelete?.userName}</span>?
                </p>
                <div className={`border rounded-lg p-3 ${
                  isDarkMode 
                    ? 'bg-red-900/20 border-red-800' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isDarkMode ? 'text-red-400' : 'text-red-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-red-300' : 'text-red-700'
                    }`}>
                      This will permanently delete the order and all associated data. This action cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 pt-0">
                <button
                  onClick={handleDeleteCancel}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
