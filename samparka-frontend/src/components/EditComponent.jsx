import { useState, useEffect } from "react";
import { X, User, Phone, MapPin, Package, Save, Calendar, ShoppingBag, Trash2, ChevronDown } from "lucide-react";
import api from "../api/config";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function EditComponent({ order, onClose, onOrderUpdated, storeId }) {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [updatedOrder, setUpdatedOrder] = useState({ ...order });
  const { authState } = useAuth();
  const { token } = authState;

  const ccyFormat = (num) => `${num.toFixed(2)}`;

  // Calculate total
  const calculateTotal = () => {
    let total = 0;
    updatedOrder.products.forEach(product => {
      total += parseFloat(product.productTotalPrice) || (parseFloat(product.productPrice) * parseInt(product.productQuantity)) || 0;
    });
    return total;
  };

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Update total when products change
  useEffect(() => {
    const newTotal = calculateTotal();
    setUpdatedOrder(prev => ({
      ...prev,
      total: newTotal
    }));
  }, [updatedOrder.products]);

  // Handle close with animation
  const handleCloseWithAnimation = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (productId, field, value) => {
    setUpdatedOrder(prev => ({
      ...prev,
      products: prev.products.map(product => {
        if (product._id === productId) {
          const updatedProduct = { ...product, [field]: value };
          // Recalculate total price if price or quantity changes
          if (field === 'productPrice' || field === 'productQuantity') {
            const price = parseFloat(updatedProduct.productPrice) || 0;
            const quantity = parseInt(updatedProduct.productQuantity) || 0;
            updatedProduct.productTotalPrice = price * quantity;
          }
          return updatedProduct;
        }
        return product;
      })
    }));
  };

  const handleDeleteProduct = (productId) => {
    setUpdatedOrder({
      ...updatedOrder,
      products: updatedOrder.products.filter(
        (product) => product._id !== productId
      ),
    });
  };

  const handleSubmit = async () => {
    try {
      // First update the order details (products, customer info, etc.)
      const orderUpdateResponse = await api.put(
        `/order/update/${updatedOrder._id}`,
        {
          ...updatedOrder,
          // Don't include status in the general update
          status: undefined
        },
        { headers: { token } }
      );

      // If status changed, update it separately using the status endpoint
      if (updatedOrder.status !== order.status) {
        const statusUpdateResponse = await api.put(
          `/order/status/${storeId}`,
          { 
            orderId: updatedOrder._id, 
            status: updatedOrder.status 
          },
          { headers: { token } }
        );
        
        if (!statusUpdateResponse.data.success) {
          toast.error("Failed to update order status");
          return;
        }
      }

      if (orderUpdateResponse.data.success) {
        toast.success("Order updated successfully!");
        // Calculate the final total before sending to parent
        const finalTotal = calculateTotal();
        const finalUpdatedOrder = {
          ...updatedOrder,
          total: finalTotal
        };
        
        // Notify parent component that order was updated
        if (onOrderUpdated) {
          onOrderUpdated(finalUpdatedOrder);
        }
        handleCloseWithAnimation();
      } else {
        toast.error(orderUpdateResponse.data.message || "Failed to update order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating order");
    }
  };

  // Extract order info
  const orderId = order._id?.slice(-5) || 'N/A';
  const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleCloseWithAnimation}
    >
      <div 
        className={`rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`} 
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header - Fixed */}
        <div className={`flex items-center justify-between p-4 border-b z-10 rounded-t-lg transition-colors ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`flex gap-2 items-center text-lg font-semibold transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <ShoppingBag className="h-4 w-4" />
            Edit Order
          </h2>
          <button
            onClick={handleCloseWithAnimation}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <div className="p-4 space-y-4">
            
            {/* Order Information */}
            <div>
              <div className='flex justify-between items-center'>
                <div>
                  <h3 className={`flex gap-2 items-center text-base font-medium mb-3 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Package className="h-4 w-4" />
                    Order Information
                  </h3>
                </div>
                <div className='flex justify-center items-center gap-2'>
                  {/* <label className={`block text-xs font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Order Status
                  </label> */}
                  <div className="relative">
                    <select
                      name="status"
                      value={updatedOrder.status}
                      onChange={handleChange}
                      className={`inline-flex items-center px-2 py-1 pr-7 rounded-md text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors appearance-none ${
                        updatedOrder.status?.toLowerCase() === 'pending'
                          ? isDarkMode 
                            ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : updatedOrder.status?.toLowerCase() === 'paid'
                          ? isDarkMode 
                            ? 'bg-green-900/30 text-green-400 border-green-600' 
                            : 'bg-green-50 text-green-700 border-green-200'
                          : updatedOrder.status?.toLowerCase() === 'sent for delivery'
                          ? isDarkMode 
                            ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                          : updatedOrder.status?.toLowerCase() === 'completed'
                          ? isDarkMode 
                            ? 'bg-emerald-900/30 text-emerald-400 border-emerald-600' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : updatedOrder.status?.toLowerCase() === 'failed' || updatedOrder.status?.toLowerCase() === 'declined'
                          ? isDarkMode 
                            ? 'bg-red-900/30 text-red-400 border-red-600' 
                            : 'bg-red-50 text-red-700 border-red-200'
                          : isDarkMode 
                          ? 'bg-gray-700 text-gray-300 border-gray-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                      style={{ backgroundColor: isDarkMode ? '#374151' : '' }}
                    >
                      <option value="pending" className={isDarkMode ? 'bg-gray-800 text-gray-300' : ''}>Pending</option>
                      <option value="paid" className={isDarkMode ? 'bg-gray-800 text-gray-300' : ''}>Paid</option>
                      <option value="sent for delivery" className={isDarkMode ? 'bg-gray-800 text-gray-300' : ''}>Sent for Delivery</option>
                      <option value="completed" className={isDarkMode ? 'bg-gray-800 text-gray-300' : ''}>Completed</option>
                      <option value="failed" className={isDarkMode ? 'bg-gray-800 text-gray-300' : ''}>Failed</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Order ID
                  </label>
                  <div className={`w-full px-2 py-1.5 border rounded-md text-sm transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-200' 
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  }`}>
                    #{orderId}
                  </div>
                </div>
                <div>
                  <label className={`flex gap-1 items-center text-xs font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    <Calendar className="h-3 w-3" />
                    Order Date
                  </label>
                  <div className={`w-full px-2 py-1.5 border rounded-md text-sm transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-200' 
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  }`}>
                    {orderDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className={`flex gap-2 items-center text-base font-medium mb-3 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`flex gap-1 items-center text-xs font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    <User className="h-3 w-3" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={updatedOrder.userName}
                    onChange={handleChange}
                    className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-200' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`flex gap-1 items-center text-xs font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="userPhone"
                    value={updatedOrder.userPhone}
                    onChange={handleChange}
                    className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-200' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className={`flex gap-1 items-center text-xs font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <MapPin className="h-3 w-3" />
                  Delivery Address
                </label>
                <input
                  type="text"
                  name="userAddress"
                  value={updatedOrder.userAddress}
                  onChange={handleChange}
                  className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-200' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className={`flex gap-2 items-center text-base font-medium mb-3 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Package className="h-4 w-4" />
                Order Items
              </h3>
              
              {updatedOrder.products.length > 0 ? (
                <div className={`border rounded-lg overflow-hidden transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  {/* Table Header */}
                  <div className={`grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-400' 
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    <div className="col-span-4">Product</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Total</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {/* Product Rows */}
                  <div className={`divide-y transition-colors ${
                    isDarkMode ? 'divide-gray-600' : 'divide-gray-100'
                  }`}>
                    {updatedOrder.products.map((product, index) => (
                      <div key={product._id} className={`grid grid-cols-12 gap-2 px-3 py-2 items-center transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}>
                        <div className="col-span-4 flex items-center gap-2">
                          {product.productImage ? (
                            <img 
                              src={product.productImage} 
                              alt={product.productName}
                              className={`w-6 h-6 rounded object-cover border transition-colors ${
                                isDarkMode ? 'border-gray-600' : 'border-gray-200'
                              }`}
                            />
                          ) : (
                            <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                              isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                            }`}>
                              <Package className={`w-3 h-3 transition-colors ${
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`} />
                            </div>
                          )}
                          <input
                            type="text"
                            value={product.productName}
                            onChange={(e) => handleProductChange(product._id, 'productName', e.target.value)}
                            className={`text-xs font-medium bg-transparent border-none focus:outline-none focus:border focus:border-green-300 rounded px-1 py-0.5 w-full transition-colors ${
                              isDarkMode 
                                ? 'text-gray-200 focus:bg-gray-700' 
                                : 'text-gray-900 focus:bg-white'
                            }`}
                          />
                        </div>
                        <div className="col-span-2 text-right">
                          <input
                            type="number"
                            value={product.productPrice}
                            onChange={(e) => handleProductChange(product._id, 'productPrice', e.target.value)}
                            className={`text-xs bg-transparent border-none focus:outline-none focus:border focus:border-green-300 rounded px-1 py-0.5 w-full text-right transition-colors ${
                              isDarkMode 
                                ? 'text-gray-300 focus:bg-gray-700' 
                                : 'text-gray-600 focus:bg-white'
                            }`}
                          />
                        </div>
                        <div className="col-span-2 text-center">
                          <input
                            type="number"
                            value={product.productQuantity}
                            onChange={(e) => handleProductChange(product._id, 'productQuantity', e.target.value)}
                            className={`text-xs bg-transparent border-none focus:outline-none focus:border focus:border-green-300 rounded px-1 py-0.5 w-full text-center transition-colors ${
                              isDarkMode 
                                ? 'text-gray-300 focus:bg-gray-700' 
                                : 'text-gray-600 focus:bg-white'
                            }`}
                          />
                        </div>
                        <div className={`col-span-3 text-right text-xs font-medium transition-colors ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          NPR {ccyFormat(product.productTotalPrice || (product.productPrice * product.productQuantity) || 0)}
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className={`p-1 rounded transition-colors ${
                              isDarkMode 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                                : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className={`px-3 py-3 border-t transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Total Items:</span>
                      <span className={`text-xs font-medium transition-colors ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>{updatedOrder.products.length}</span>
                    </div>
                    <div className={`flex justify-between items-center pt-1 border-t transition-colors ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={`text-sm font-semibold transition-colors ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>Total Amount</span>
                      <span className={`text-md font-semibold transition-colors ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>NPR {ccyFormat(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`border rounded-lg p-6 text-center transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <Package className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-300'
                  }`} />
                  <p className={`text-sm transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No products found in this order.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-4 border-t rounded-b-lg transition-colors ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={handleCloseWithAnimation}
            className={`px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
          >
            <Save className="w-3 h-3" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
