import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, Box } from '@mui/material';
import { X, User, Phone, MapPin, Package, Edit, Calendar, ShoppingBag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function OrderModal({ open, handleClose, selectedOrderProducts, orderInfo, onEditOrder }) {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const ccyFormat = (num) => `${num.toFixed(2)}`;
  let subTotal = 0;
  selectedOrderProducts.forEach(product => {
    subTotal += product.productTotalPrice || (product.productPrice * product.productQuantity) || 0;
  });

  // Extract order info or use defaults
  const orderId = orderInfo?.id || 'N/A';
  const orderDate = orderInfo?.orderDate || new Date().toLocaleDateString();
  const customerName = orderInfo?.userName || 'Unknown Customer';
  const customerPhone = orderInfo?.userPhone || 'N/A';
  const customerAddress = orderInfo?.userAddress || 'No address provided';
  const orderStatus = orderInfo?.status || 'pending';

  // Trigger animation on mount
  useEffect(() => {
    if (open) {
      setIsVisible(true);
    }
  }, [open]);

  // Handle edit order action
  const handleEditOrder = () => {
    if (onEditOrder && orderInfo) {
      onEditOrder(orderInfo);
      handleCloseWithAnimation();
    }
  };
  const handleCloseWithAnimation = () => {
    setIsVisible(false);
    setTimeout(() => {
      handleClose();
    }, 300); // Wait for animation to complete
  };

  if (!open) return null;

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
            Order Details
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleEditOrder}
              className={`transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Edit size={18} />
            </button>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <div className="p-4 space-y-4">
            
            {/* Order Information */}
            <div>

              <div className='flex justify-between items-center '>
                <div>


              <h3 className={`flex gap-2 items-center text-base font-medium mb-3 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Package className="h-4 w-4" />
                Order Information
              </h3>
</div>


                <div className='flex justify-center items-center gap-2 '>

                {/* <label className={`block text-xs font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Order Status
                </label> */}
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                  orderStatus.toLowerCase() === 'delivered' 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : orderStatus.toLowerCase() === 'pending'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : orderStatus.toLowerCase() === 'paid'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : orderStatus.toLowerCase() === 'sent for delivery'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : orderStatus.toLowerCase() === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : orderStatus.toLowerCase() === 'failed' || orderStatus.toLowerCase() === 'declined'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 border border-gray-600'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                </span>
               

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
                  <div className={`w-full px-2 py-1.5 border rounded-md text-sm transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-200' 
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  }`}>
                    {customerName}
                  </div>
                </div>
                <div>
                  <label className={`flex gap-1 items-center text-xs font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </label>
                  <div className={`w-full px-2 py-1.5 border rounded-md text-sm transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-200' 
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  }`}>
                    {customerPhone}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <label className={`flex gap-1 items-center text-xs font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  <MapPin className="h-3 w-3" />
                  Delivery Address
                </label>
                <div className={`w-full px-2 py-1.5 border rounded-md text-sm transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-200' 
                    : 'border-gray-300 bg-gray-50 text-gray-900'
                }`}>
                  {customerAddress}
                </div>
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
              
              {selectedOrderProducts.length > 0 ? (
                <div className={`border rounded-lg overflow-hidden transition-colors ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  {/* Table Header */}
                  <div className={`grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-400' 
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>

                  {/* Product Rows */}
                  <div className={`divide-y transition-colors ${
                    isDarkMode ? 'divide-gray-600' : 'divide-gray-100'
                  }`}>
                    {selectedOrderProducts.map((product, index) => (
                      <div key={index} className={`grid grid-cols-12 gap-2 px-3 py-2 items-center transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}>
                        <div className="col-span-5 flex items-center gap-2">
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
                          <span className={`text-xs font-medium truncate transition-colors ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>{product.productName}</span>
                        </div>
                        <div className={`col-span-2 text-right text-xs transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          NPR {ccyFormat(product.productPrice)}
                        </div>
                        <div className={`col-span-2 text-center text-xs transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {product.productQuantity}
                        </div>
                        <div className={`col-span-3 text-right text-xs font-medium transition-colors ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          NPR {ccyFormat(product.productTotalPrice || (product.productPrice * product.productQuantity))}
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
                      }`}>{selectedOrderProducts.length}</span>
                    </div>
                    <div className={`flex justify-between items-center pt-1 border-t transition-colors ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span className={`text-sm font-semibold transition-colors ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>Total Amount</span>
                      <span className={`text-md font-semibold transition-colors ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>NPR {ccyFormat(subTotal)}</span>
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
      </div>
    </div>
  );
}
