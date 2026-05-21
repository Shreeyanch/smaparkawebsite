import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const fetchCartItems = () => {
    const request = window.indexedDB.open("cartDb", 2);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("cartItems")) {
        db.createObjectStore("cartItems", { keyPath: "productId" });
      }
    };

    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("cartItems")) {
        console.error("cartItems store not found in cartDb");
        return;
      }

      const transaction = db.transaction("cartItems", "readonly");
      const store = transaction.objectStore("cartItems");
      const getAllItemsRequest = store.getAll();

      getAllItemsRequest.onsuccess = (event) => {
        const items = event.target.result;

        setCartItems(items);

        const quantity = items.reduce(
          (acc, item) => acc + item.productQuantity,
          0
        );
        const total = items.reduce(
          (acc, item) => acc + parseFloat(item.productTotalPrice || 0),
          0
        );

        setTotalQuantity(quantity);
        setTotalPrice(total);
      };

      getAllItemsRequest.onerror = () => {
        console.error("Error fetching cart items from IndexedDB");
      };
    };

    request.onerror = () => {
      console.error("Error opening IndexedDB");
    };
  };

  const addOrUpdateItem = (newItem) => {
    const request = window.indexedDB.open("cartDb", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction("cartItems", "readwrite");
      const store = transaction.objectStore("cartItems");

      const getRequest = store.get(newItem.productId);

      getRequest.onsuccess = (event) => {
        const existingItem = event.target.result;

        if (existingItem) {
          // Update quantity and total price
          existingItem.productQuantity += newItem.productQuantity;
          existingItem.productTotalPrice += newItem.productTotalPrice;

          const updateRequest = store.put(existingItem);
          updateRequest.onsuccess = () => {
            fetchCartItems(); // Refresh cart items
          };
          updateRequest.onerror = () => {
            console.error("Failed to update item");
          };
        } else {
          // Item doesn't exist, add it
          const addRequest = store.add(newItem);
          addRequest.onsuccess = () => {
            fetchCartItems(); // Refresh cart items
          };
          addRequest.onerror = () => {
            console.error("Failed to add new item");
          };
        }
      };

      getRequest.onerror = () => {
        console.error("Error fetching item from IndexedDB");
      };
    };

    request.onerror = () => {
      console.error("Error opening IndexedDB");
    };
  };

  const removeItem = (id) => {
    const request = window.indexedDB.open("cartDb", 2);

    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction("cartItems", "readwrite");
      const store = transaction.objectStore("cartItems");

      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => {
        fetchCartItems(); // Refresh the cart items after deletion
      };

      deleteRequest.onerror = () => {
        console.error(`Failed to remove item with id ${id}`);
      };
    };
  };

  const updateItemQuantity = (productId, change) => {
    const request = window.indexedDB.open("cartDb", 2);

    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction("cartItems", "readwrite");
      const store = transaction.objectStore("cartItems");

      const getRequest = store.get(productId);

      getRequest.onsuccess = (event) => {
        const item = event.target.result;
        if (item) {
          // Update the quantity and total price
          item.productQuantity += change;
          if (item.productQuantity <= 0) {
            removeItem(productId); // Remove the item if quantity is zero
          } else {
            item.productTotalPrice =
              item.productPrice * item.productQuantity;

            const updateRequest = store.put(item);
            updateRequest.onsuccess = () => {
              fetchCartItems(); // Refresh the cart
            };
            updateRequest.onerror = () => {
              console.error("Failed to update item quantity");
            };
          }
        }
      };

      getRequest.onerror = () => {
        console.error("Error fetching item from IndexedDB");
      };
    };

    request.onerror = () => {
      console.error("Error opening IndexedDB");
    };
  };

  useEffect(() => {
    fetchCartItems(); // Fetch cart items when the provider mounts
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        totalQuantity,
        fetchCartItems,
        addOrUpdateItem,
        removeItem,
        updateItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
