import PropTypes from "prop-types";
import { useCart } from "../../context/CartProvider";
import { X } from "lucide-react";

const CartProductComponent = ({ className = "" }) => {
  const { cartItems, removeItem, updateItemQuantity } = useCart();

  const handleQuantityChange = (id, change) => {
    updateItemQuantity(id, change);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {cartItems.map((item) => (
        <div
          key={item.productId}
          className="self-stretch border-gray-400 border-b-[1px] border-solid flex flex-row items-start justify-start p-2.5 gap-[15px] text-left text-base text-black font-poppins lg:self-stretch lg:w-auto"
        >
          <div
            className="w-20 h-20 object-cover rounded-3xs bg-center bg-cover bg-no-repeat rounded-md"
            alt={item.productName}
            style={{ backgroundImage: `url(${item.productImage})` }}
          />
          <div className="flex-1 flex flex-col items-start justify-start gap-[5px]">
            <div className="relative tracking-[0.01em] font-medium">
              {item.productName}
            </div>
            <b className="relative text-sm tracking-[0.01em]">Rs</b>
            <div className="rounded-3xs border-gray-300 border-[1px] border-solid box-border h-[41px] flex flex-row items-center justify-center p-2.5 gap-[25px] text-smi">
              <button
                className="cursor-pointer bg-transparent text-sm font-poppins text-black"
                onClick={() => handleQuantityChange(item.productId, 1)}
              >
                +
              </button>
              <div className="relative tracking-[0.01em]">
                {item.productQuantity}
              </div>
              <button
                className="cursor-pointer bg-transparent text-sm font-poppins text-black"
                onClick={() => handleQuantityChange(item.productId, -1)}
              >
                -
              </button>
            </div>
          </div>
          <X
            className="w-5 h-5 cursor-pointer"
            onClick={() => removeItem(item.productId)}
          />
        </div>
      ))}
    </div>
  );
};

CartProductComponent.propTypes = {
  className: PropTypes.string,
};

export default CartProductComponent;
