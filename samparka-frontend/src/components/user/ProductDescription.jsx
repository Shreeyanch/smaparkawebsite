// import { useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
// import useFetchProducts from "../../hooks/useFetchProducts";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/config";

// eslint-disable-next-line react/prop-types
const ProductDescription = ({ className = "", store, selectedCategory }) => {
  const fetchProducts = async ({ store }) => {
    const response = await api.get(`/product/getProducts/${store.url}`);
    return response.data;
  };
  // const navigate = useNavigate();

  // const { products, loading, error } = useFetchProducts(store);

  const {
    data: products,
    isLoading: loading,
    error,
  } = useQuery({
    // eslint-disable-next-line react/prop-types
    queryKey: ["products"], // queryKey must be an array or unique string
    queryFn: () => fetchProducts(store), // queryFn must be a function returning a promise
  });

  const filteredProducts =
    selectedCategory && selectedCategory !== "All"
      ? products?.products?.filter((item) => item.category === selectedCategory)
      : products?.products;

  // const onProductDescriptionContainerClick = useCallback(() => {
  //   navigate("/sp");
  // }, [navigate]);

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-gray-300 p-5 text-base1">
      <div className="text-center">
        <b className="text-xl text-h1">Products </b>
        {selectedCategory && selectedCategory !== "All" && (
          <span className="text-gray-500 text-sm">- {selectedCategory}</span>
        )}
      </div>
      <div className="mt-5">
        {loading && <p>Loading Products...</p>}
        {error && <p className="text-red-500">{error.message}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {filteredProducts?.length > 0 ? (
            filteredProducts?.map((item, index) => (
              <Link
                key={index}
                to={`/products/${item._id}`}
                className={`flex flex-col items-center justify-start gap-2 cursor-pointer text-left text-black font-poppins w-full ${className}`}
              >
                <img
                  className="w-full h-[180px] object-cover rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                  alt={item.name}
                  src={item.images[0]}
                />
                <div className="w-full text-center mt-2">
                  <div className="tviewTypeext-sm sm:text-base font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                    {item.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 overflow-hidden line-clamp-2">
                    {item.description}
                  </div>
                  {item.discountRate > 0 ? (
                    <>
                      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm mt-1">
                        <span className="line-through text-red-500">
                          Rs. {item.price}
                        </span>
                        <b className="text-black">
                          Rs. {item.calculatedPrice || item.price}
                        </b>
                      </div>

                      <div className="text-green-500 font-semibold text-xs sm:text-sm mt-1">
                        {item.discountRate}% Off
                      </div>
                    </>
                  ) : (
                    <>
                       <div className="flex items-center justify-center gap-2 text-xs sm:text-sm mt-1">
                        
                        <b className="text-black">
                         Rs. {item.calculatedPrice || item.price}
                        </b>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">
              No products available in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ProductDescription.propTypes = {
  className: PropTypes.string,
};

export default ProductDescription;
