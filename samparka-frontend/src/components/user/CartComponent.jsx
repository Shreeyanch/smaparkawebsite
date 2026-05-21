import { useEffect } from "react";
import PropTypes from "prop-types";
import CartProductComponent from "./CartProductComponent";
import { useCart } from "../../context/CartProvider";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const CartComponent = ({ className = "", onClose }) => {
  const { totalPrice, cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const scrollAnimElements = document.querySelectorAll(
      "[data-animate-on-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-[pulseCircle]");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    scrollAnimElements.forEach((el) => observer.observe(el));

    return () => scrollAnimElements.forEach((el) => observer.unobserve(el));
  }, []);

  const handleCheckout = () => {
    navigate("/products/checkout", {
      state: {
        items: cartItems,
        totalPrice: totalPrice,
      },
    });
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-[400px] max-w-[100vw] bg-white shadow-lg flex flex-col"
    >
      <div
        className={`h-full flex flex-col ${className}`}
        data-animate-on-scroll
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <b className="text-xl">Cart</b>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Cart Products */}
        <div className="flex-1 overflow-y-auto p-4">
          <CartProductComponent />
        </div>

        {/* Checkout Button */}
        <div className="p-4 border-t border-gray-300">
          <button
            onClick={handleCheckout}
            className="w-full bg-darkslategray text-white py-2.5 rounded-lg "
          >
            <b className="text-sm">Checkout</b>
            <div className="text-sm">Rs {totalPrice.toFixed(2)}</div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

CartComponent.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default CartComponent;
