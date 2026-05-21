import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Edit2, Plus, Trash2 } from "lucide-react";

const Category = () => {
  const [stores, setStores] = useState([]);

  const [selected, setSelected] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const { authState } = useAuth();
  const { userInfo: user,token } = authState;
  const [categories, setCategories] = useState([]);
  const [storeURL, setStoreURL] = useState("");
  const [storeId, setStoreId] = useState("");
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const fetchCategory = async () => {
    try {
      const response = await api.get(
        `/product/categoriesWithProductCount/${selected}`,
        {
          headers: { token },
        }
      );

      if (response.data) {
        // Directly map response into DataGrid format
        const formattedCategories = response.data.map((category, index) => ({
          id: index + 1, // Unique ID for DataGrid
          categoryName: category.categoryName, // Category name from response
          noOfProducts: category.noOfProducts, // Number of products from response
        }));

        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories: ", error);
      toast.error("Failed to fetch categories.");
    }
  };


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


  // Handle opening the dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Handle closing the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Handle input change
  const handleCategoryNameChange = (e) => {
    setCategoryName(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async() => {
    try{
      const response = await api.post(`/product/addCategory/${selected}`,
        {categoryName},
        {
          headers:{
            token
          }
        }
      );
      if(response.data.success){
        toast.success("Category Added Succesfully!",{
          duration:1000,
          
        })
        fetchCategory();
        setCategoryName("");
      }
      setOpen(false); // Close the dialog after submitting
    }catch(error){
      console.error(error);
      toast.error(error.message,{duration:2000});
    }
  };

  useEffect(() => {
    if(selected){

      fetchCategory();
    }
  }, [selected]);

  const handleEdit = async (category) => {
    const newCategoryName = prompt(
      "Enter new Category name: ",
      category.categoryName
    );

    if(newCategoryName == null){
      return;
    }

    if (newCategoryName === category.categoryName) {
      toast.error("Enter correct new category Name");
      return;
    }

    try {
      const response = await api.put(`/product/categories/edit/${selected}`, {
        oldCategoryName: category.categoryName,
        newCategoryName,
      });

      if (response.data.status) {
        toast.success("Category updated succesfully");
        fetchCategory();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  // Handle delete action
  const handleDelete = async (category) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the category: ${category.categoryName}?`
    );

    if (!isConfirmed) {
      return;
    }
    try {
      const response = await api.delete(
        `/product/categories/delete/${selected}`,
        {
          data: { categoryName: category.categoryName }, // Correctly pass the data here
        }
      );

      if (response.data.success) {
        toast.success("Category Deleted Succesfully");
        fetchCategory();
      }
    } catch (error) {
      console.error("Error deleting; ", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 sm:ml-64">
      <div className="p-4 sm:p-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Categories</h1>
            <p className="text-xs text-gray-500">Manage product categories</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              onChange={(e) => {
                const selectedIndex = e.target.selectedIndex;
                const selectedOption = e.target.options[selectedIndex];
                setStoreURL(e.target.value);
                setStoreId(selectedOption.getAttribute("data-id"));
                setSelected(e.target.value);
              }}
              value={selected}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option disabled value="">
                Select Store
              </option>
              {stores.map((store) => (
                <option value={store._id} key={store._id} data-id={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleClickOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* Compact Categories Grid */}
        {selected && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categories.map((category, index) => (
              <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate" title={category.categoryName}>
                      {category.categoryName}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-4 h-4 bg-blue-50 rounded flex items-center justify-center text-xs font-semibold text-blue-700">
                        {category.noOfProducts}
                      </span>
                      <span className="text-xs text-gray-500">products</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selected ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-300 mb-3">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No Categories Found</h3>
            <p className="text-gray-500 text-sm">No categories have been created for this store yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-300 mb-3">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v9.5" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Select a Store</h3>
            <p className="text-gray-500 text-sm">Please select a store to view its categories.</p>
          </div>
        )}

        {/* Compact Add Category Modal */}
        <Dialog 
          open={open} 
          onClose={handleClose}
          PaperProps={{
            sx: {
              bgcolor: "#ffffff",
              color: "#111827",
              borderRadius: 2,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              minWidth: '350px',
            },
          }}
        >
          <DialogTitle sx={{ 
            pb: 1, 
            fontSize: '1.125rem', 
            fontWeight: 600,
            color: '#111827',
            borderBottom: '1px solid #f3f4f6'
          }}>
            Add New Category
          </DialogTitle>
          <DialogContent sx={{ pt: 2, pb: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              id="categoryName"
              label="Category Name"
              type="text"
              fullWidth
              size="small"
              variant="outlined"
              value={categoryName}
              onChange={handleCategoryNameChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.5rem',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#10b981',
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
            <Button 
              onClick={handleClose}
              size="small"
              sx={{
                color: '#6b7280',
                bgcolor: '#f3f4f6',
                '&:hover': {
                  bgcolor: '#e5e7eb',
                },
                borderRadius: '0.5rem',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 0.5,
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              size="small"
              sx={{
                color: 'white',
                bgcolor: '#10b981',
                '&:hover': {
                  bgcolor: '#059669',
                },
                borderRadius: '0.5rem',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 0.5,
              }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>

  );
};
export default Category;
