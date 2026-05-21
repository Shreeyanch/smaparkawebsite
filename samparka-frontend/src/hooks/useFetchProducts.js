import {useState, useEffect} from "react";
import api from "../api/config";

const useFetchProducts = (store) =>{
    const [products, setProducts] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect(()=>{
        const fetchProducts = async ()=>{
            try{
                const response = await api.get(`/product/getProducts/${store.url}`);
                if(response.data){
                    setProducts(response.data);
                }

            }catch(error){
                setError(error.message);
            }finally{
                setLoading(false);
            }
        };
        fetchProducts();

    },[store]);
    return {products,loading,error};
}

export default useFetchProducts;
