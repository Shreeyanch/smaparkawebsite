import { useEffect, useState } from "react";
import api from "../api/config";

const useFetchSingleProducts = (productId)=>{
    const [product,setProduct] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect(()=>{
        const fetchSingleProduct = async ()=>{
            if (!productId || productId.length !== 24) {
                setError("Invalid ProductId");
                setLoading(false);
                return;
            }

            try{
                const response = await api.get(`/product/getProduct/${productId}`);
                if(response.data){
                    setProduct(response.data);
                }
            }catch(error){
                setError(error.message);
            }finally{
                setLoading(false);
            }
        }
        fetchSingleProduct();
    },[productId]);
    return {product,loading,error};
}
export default useFetchSingleProducts;