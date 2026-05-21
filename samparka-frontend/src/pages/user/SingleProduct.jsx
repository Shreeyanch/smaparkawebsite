import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import useFetchSingleProducts from "../../hooks/useFetchSingleProduct";
import Slider from "react-slick"; // Import react-slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/config";

const SingleProduct = ({ className = "" }) => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const fetchSinglelProduct = async (productId) => {
    const response = await api.get(`/product/getProduct/${productId}`);
    return response.data;
  };

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchSinglelProduct(productId),
  });

  // const { product, loading, error } = useFetchSingleProducts(productId);
  const [quantity, setQuantity] = useState(1);

  const onVectorIconClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Slick Carousel settings
  const settings = {
    dots: true, // Show dots
    infinite: true, // Infinite loop
    speed: 500, // Transition speed
    slidesToShow: 1, // Show one image at a time
    slidesToScroll: 1, // Scroll one image at a time
    autoplay: true, // Auto-play the carousel
    autoplaySpeed: 3000, // Set auto-play speed
  };

  // Calculate total price
  const pricePerItem = product?.calculatedPrice || product?.price || 0;
  const totalPrice = pricePerItem * quantity;

  // Handle quantity change
  const handleQuantityChange = (event) => {
    const value = event.target.value;
    if (value === "" || (!isNaN(value) && Number(value) > 0)) {
      setQuantity(Number(value));
    }
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Decrease quantity (minimum 1)
  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Helper function to open or create IndexedDB
  // Helper function to open or create IndexedDB
  const openDb = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("cartDb", 2);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains("cartItems")) {
          const objectStore = db.createObjectStore("cartItems", {
            keyPath: "id", // ✅ Keep keyPath, but REMOVE autoIncrement
          });

        } else {
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.error);
        reject(event.target.error);
      };
    });
  };

  const addToCartDb = async (product, quantity, totalPrice) => {
    try {
      const db = await openDb();

      if (!db.objectStoreNames.contains("cartItems")) {
        console.error("Object store 'cartItems' not found.");
        return;
      }

      const transaction = db.transaction("cartItems", "readwrite");
      const store = transaction.objectStore("cartItems");

      // Step 1: Get all items to check category conflict
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const allItems = getAllRequest.result;

        const currentCategory = product.category.toLowerCase();

        // Define what counts as a reservation-type product
        const isReservationType = (category) =>
          category === "reservation" || category === "booking";

        const cartHasReservation = allItems.some((item) =>
          isReservationType(item.category?.toLowerCase())
        );

        const cartHasNonReservation = allItems.some(
          (item) => !isReservationType(item.category?.toLowerCase())
        );

        const isCurrentReservation = isReservationType(currentCategory);

        const isConflict =
          (cartHasReservation && !isCurrentReservation) ||
          (cartHasNonReservation && isCurrentReservation);

        if (isConflict) {
          toast.error(
            "You can't mix 'Reservation' and normal items in the cart."
          );
          return; // ❌ Stop further execution
        }

        // Step 2: Check if item already exists
        const existingItemRequest = store.get(product._id);

        existingItemRequest.onsuccess = () => {
          const existingItem = existingItemRequest.result;

          if (existingItem) {
            existingItem.productQuantity += quantity;
            existingItem.productTotalPrice += totalPrice;

            const updateRequest = store.put(existingItem);
            updateRequest.onsuccess = () => {
              toast.success("Cart updated successfully!", {
                duration: 1000,
                onAutoClose: () => window.location.reload(),
              });
            };
            updateRequest.onerror = (event) => {
              console.error("Error updating item:", event.target.error);
            };
          } else {
            const newItem = {
              productId: product._id,
              productPrice: product.calculatedPrice,
              productName: product.name,
              productQuantity: quantity,
              category: product.category,
              productTotalPrice: totalPrice,
              productImage: product.images?.[0] || "",
            };

            const addRequest = store.add(newItem);
            addRequest.onsuccess = () => {
              toast.success("Item added to cart!", {
                duration: 1000,
                onAutoClose: () => window.location.reload(),
              });
            };
            addRequest.onerror = (event) => {
              console.error("Error adding item:", event.target.error);
            };
          }
        };

        existingItemRequest.onerror = (event) => {
          console.error("Error checking existing item:", event.target.error);
        };
      };

      getAllRequest.onerror = (event) => {
        console.error("Error fetching all cart items:", event.target.error);
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
      };
    } catch (error) {
      console.error("Error interacting with IndexedDB:", error);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    addToCartDb(product, quantity, totalPrice);
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    navigate("/products/checkout", {
      state: {
        items: [
          {
            productId,
            productImage: product.images[0],
            productName: product.name,
            productQuantity: quantity,
            category: product.category,
            productPrice: product.calculatedPrice,
            productTotalPrice: totalPrice,
          },
        ],

        totalPrice: totalPrice,
      },
    });
  };

  if (product) {
    return (
      <div className="bg-white min-h-screen">
        <button
          className="cursor-pointer border-none py-[15px] px-2.5 bg-transparent self-stretch flex items-center justify-start"
          onClick={onVectorIconClick}
        >
          <img
            className="w-[11.8px] h-[21px] cursor-pointer"
            alt="Back"
            src="/vector4.svg"
          />
        </button>
        {product && (
          <div
            className={`flex items-center justify-center w-full h-screen bg-white ${className} overflow-hidden`}
          >
            <div className="w-full max-w-[440px] h-full bg-white flex flex-col items-center justify-start py-0 px-4 sm:px-[30px] text-left font-poppins overflow-y-auto flex-grow pb-[70px]">
              <div className="w-full">
                {product.images && product.images.length > 1 ? (
                  <Slider {...settings}>
                    {product.images.map((image, index) => (
                      <div key={index}>
                        <img
                          className="max-w-full h-auto object-cover max-h-[350px]"
                          alt={`${product.name} ${index + 1}`}
                          src={image}
                        />
                      </div>
                    ))}
                  </Slider>
                ) : product.images && product.images.length === 1 ? (
                  <img
                    className="max-w-full h-auto object-cover max-h-[350px]"
                    alt={product.name}
                    src={product.images[0]}
                  />
                ) : (
                  <p className="text-gray-500 text-center">
                    No image available for this product
                  </p>
                )}
              </div>
              <div className="w-full px-[18px] mt-2">
                <div className="text-lg font-medium">{product.name}</div>
                <div
                  className="text-xs text-gray-500 mb-4"
                  style={{
                    maxHeight: "50px", // Set max height for description
                    overflowY: "auto", // Enable scrolling if content exceeds max height
                  }}
                >
                  {product.description}
                </div>
                {product.trackStock &&
                  (product.stock !== undefined || product.stock !== null ? (
                    <div className="mt-4">
                      <strong className="text-gray-800">In Stock: </strong>
                      <span
                        className={
                          product.stock > 0 ? "text-grey-600" : "text-red-600"
                        }
                      >
                        {product.stock > 0
                          ? `${product.stock} items available`
                          : "Out of Stock"}
                      </span>
                    </div>
                  ) : (
                    <></>
                  ))}
                {/* Render specificity if it exists */}
                {product.specificity && (
                  <div className="mt-4">
                    {/* <h3 className="text-2xl font-semibold text-gray-800">Specificity</h3> */}
                    {Object.entries(product.specificity).map(
                      ([key, value], index) => (
                        <div key={index} className="mt-2">
                          <strong className="text-lg text-gray-700">
                            {key}:
                          </strong>
                          {Array.isArray(value) ? (
                            <div className="mt-2">
                              {value.map((val, idx) => (
                                <p key={idx} className="text-gray-600">
                                  {val}
                                </p>
                              ))}
                            </div>
                          ) : typeof value === "object" && value !== null ? (
                            <div className="mt-2">
                              {Object.entries(value).map(
                                ([subKey, subValue], subIndex) => (
                                  <p
                                    key={subIndex}
                                    className="text-gray-600"
                                  >{`${subKey}: ${subValue}`}</p>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-600">{value}</p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Price Section */}
                <div className="flex items-center justify-between text-sm mb-4 mt-2">
                  {product.discountRate > 0 ? (
                    <>
                      {/* Discount Label */}
                      <div className="text-red-500 font-semibold text-lg">
                        {product.discountRate}% Off
                      </div>

                      {/* Original Price + Discounted Price (Aligned Right) */}
                      <div className="flex items-center ml-auto">
                        <div className="line-through text-red-500 text-xs mr-2">
                          Rs {product.price}
                        </div>
                        <div className="text-lg font-bold">
                          Rs {pricePerItem}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* If No Discount, Show Just the Price on the Left */
                    <div className="text-lg font-bold">Rs. {product.price}</div>
                  )}
                </div>
              </div>
              {/* Quantity Section */}
              <div className="w-full border-t-[1px] border-b-[1px] border-gray-300 py-4 px-[18px] mt-4 flex justify-between items-center">
                <div className="text-sm font-bold">Quantity</div>
                <div className="flex items-center border border-gray-300 rounded-3xs px-3 py-2">
                  <button
                    className="cursor-pointer text-lg"
                    onClick={decreaseQuantity}
                    disabled={quantity < 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="w-10 text-center text-sm mx-2 border-none outline-none bg-transparent"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={1}
                    max={product.stock}
                  />
                  <button
                    className="cursor-pointer text-lg"
                    onClick={increaseQuantity}
                    // disabled={product.stock && quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons Section (Add to Cart & Buy Now) */}
              <div className="fixed bottom-0 w-full shadow-lg py-5 px-[18px] flex justify-between space-x-4 z-10 bg-white">
                <button
                  className="w-full py-1.5 bg-gray-800 text-white rounded-md flex justify-center"
                  onClick={() => handleAddToCart()}
                >
                  <b className="text-right">Add</b>
                  <div className="text-left ml-2">Rs {totalPrice}</div>
                </button>
                <button
                  className="w-full py-1.5 bg-green-500 text-white rounded-md flex justify-center"
                  onClick={() => handleBuyNow()}
                >
                  <b className="text-right">Buy Now</b>
                  <div className="text-left ml-2">Rs {totalPrice}</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">Error Encountered</p>
      </div>
    );
  }

  return null;
};

SingleProduct.propTypes = {
  className: PropTypes.string,
};

export default SingleProduct;
