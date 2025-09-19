import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faTimes, faCheck, faUpload } from '@fortawesome/free-solid-svg-icons';

const Addproduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    productName: '',
    brand: '',
    description: '',
    fabric: '',
    color: '',
    stock: 0,
    price: 0,
    sizes: [],
    image: null,
    other_images: [],
    category: '',
    subcategory: '',
    isActive: true,
    featured: false,
    tags: []
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOtherImages, setPreviewOtherImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newSize, setNewSize] = useState('');

  useEffect(() => {
    fetchData();
  }, []);


  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          }
        }),
        axios.get(`${API_URL}/api/categories`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          }
        })
      ]);
      
      setProducts(productsRes.data.data || productsRes.data);
      setCategories(categoriesRes.data.data || categoriesRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await axios.get(`${API_URL}/api/subcategories/category/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        }
      });
      setSubcategories(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCurrentProduct({
      ...currentProduct,
      category: categoryId,
      subcategory: '' // Reset subcategory when category changes
    });
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files && files.length > 0) {
      if (name === 'image') {
        // Handle main image
        const file = files[0];
        
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`);
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError(`${file.name} is too large (max 5MB)`);
          return;
        }
        
        setCurrentProduct({
          ...currentProduct,
          image: file
        });
        
        // Create preview for the main image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        
      } else if (name === 'other_images') {
        // Handle other images
        const validFiles = Array.from(files).filter(file => {
          if (!file.type.startsWith('image/')) {
            setError(`${file.name} is not an image file`);
            return false;
          }
          if (file.size > 5 * 1024 * 1024) {
            setError(`${file.name} is too large (max 5MB)`);
            return false;
          }
          return true;
        });
        
        if (validFiles.length === 0) return;
        
        // Limit to 10 additional images
        const maxFiles = 10;
        const filesToAdd = validFiles.slice(0, maxFiles - currentProduct.other_images.length);
        
        if (filesToAdd.length < validFiles.length) {
          setError(`Only ${maxFiles} additional images allowed`);
        }
        
        setCurrentProduct({
          ...currentProduct,
          other_images: [...currentProduct.other_images, ...filesToAdd]
        });
        
        // Create previews for other images
        const newPreviews = [];
        filesToAdd.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result);
            if (newPreviews.length === filesToAdd.length) {
              setPreviewOtherImages([...previewOtherImages, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
      
      setError(null); // Clear any previous errors
    } else if (name === 'tags') {
      const tagArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setCurrentProduct({
        ...currentProduct,
        tags: tagArray
      });
    } else {
      setCurrentProduct({
        ...currentProduct,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError(null);
    
    // Validate sizes
    if (!currentProduct.sizes || currentProduct.sizes.length === 0) {
      setError('At least one size is required');
      return;
    }
    
    // Validate image for new products
    if (!isEditing && !currentProduct.image) {
      setError('Product image is required');
      return;
    }
    
    try {
      const formData = new FormData();
      
      // Add all product fields
      formData.append('productName', currentProduct.productName);
      formData.append('brand', currentProduct.brand);
      formData.append('description', currentProduct.description);
      formData.append('fabric', currentProduct.fabric);
      formData.append('color', currentProduct.color);
      formData.append('stock', parseInt(currentProduct.stock) || 0);
      formData.append('price', parseFloat(currentProduct.price) || 0);
      formData.append('sizes', JSON.stringify(currentProduct.sizes));
      formData.append('category', currentProduct.category);
      formData.append('subcategory', currentProduct.subcategory);
      formData.append('isActive', currentProduct.isActive);
      formData.append('featured', currentProduct.featured);
      formData.append('tags', JSON.stringify(currentProduct.tags));

      // Append main image file
      if (currentProduct.image) {
        formData.append('image', currentProduct.image);
      }

      // Handle other images - separate existing URLs from new files
      if (isEditing) {
        // For editing, we need to preserve existing images and add new ones
        const existingImages = [];
        const newImageFiles = [];
        
        if (currentProduct.other_images && currentProduct.other_images.length > 0) {
          console.log('Processing other_images array:', currentProduct.other_images);
          currentProduct.other_images.forEach((item) => {
            console.log('Item type:', typeof item, 'Item:', item);
            if (typeof item === 'string') {
              // This is an existing image URL
              existingImages.push(item);
            } else if (item instanceof File) {
              // This is a new file
              newImageFiles.push(item);
            }
          });
        }
        
        // Send existing image URLs as JSON
        if (existingImages.length > 0) {
          formData.append('existing_other_images', JSON.stringify(existingImages));
          console.log('Sending existing images:', existingImages);
        }
        
        // Send new image files
        newImageFiles.forEach((file) => {
          formData.append('other_images', file);
        });
        console.log('Sending new image files:', newImageFiles.length);
      } else {
        // For new products, only send new files
        if (currentProduct.other_images && currentProduct.other_images.length > 0) {
          currentProduct.other_images.forEach((file) => {
            if (file instanceof File) {
              formData.append('other_images', file);
            }
          });
        }
      }

      console.log('Submitting product with image:', {
        productName: currentProduct.productName,
        hasImage: !!currentProduct.image,
        sizes: currentProduct.sizes,
        sizesStringified: JSON.stringify(currentProduct.sizes),
        category: currentProduct.category,
        subcategory: currentProduct.subcategory
      });

      if (isEditing) {
        await axios.put(`${API_URL}/api/products/${currentProduct._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}/api/products`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(isEditing ? 'Failed to update product' : 'Failed to create product');
      }
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct({
      _id: product._id,
      productName: product.productName,
      brand: product.brand,
      description: product.description,
      fabric: product.fabric,
      color: product.color,
      stock: product.stock,
      price: product.price,
      sizes: product.sizes || (product.size ? [product.size] : []),
      image: null, // Reset image for new uploads
      other_images: product.other_images || [], // Keep existing other images
      category: product.category._id || product.category,
      subcategory: product.subcategory._id || product.subcategory,
      isActive: product.isActive,
      featured: product.featured,
      tags: product.tags || []
    });
    
    // Fetch subcategories for the selected category
    if (product.category._id || product.category) {
      fetchSubcategories(product.category._id || product.category);
    }
    
    // Set preview image from existing product image
    if (product.image) {
      setPreviewImage(product.image);
    } else {
      setPreviewImage(null);
    }
    
    // Set preview other images from existing product other images
    if (product.other_images && product.other_images.length > 0) {
      // Convert URLs to proper format for preview
      const imageUrls = product.other_images.map(imageUrl => {
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        } else if (imageUrl.startsWith('/uploads/')) {
          return `http://localhost:5000${imageUrl}`;
        } else if (imageUrl.startsWith('/')) {
          return `http://localhost:5000${imageUrl}`;
        } else {
          return `http://localhost:5000/uploads/products/${imageUrl}`;
        }
      });
      setPreviewOtherImages(imageUrls);
    } else {
      setPreviewOtherImages([]);
    }
    
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/api/products/${id}`, {
            headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          }
        });
        fetchData();
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const resetForm = () => {
    setCurrentProduct({
      productName: '',
      brand: '',
      description: '',
      fabric: '',
      color: '',
      stock: 0,
      price: 0,
      sizes: [],
      image: null,
      other_images: [],
      category: '',
      subcategory: '',
      isActive: true,
      featured: false,
      tags: []
    });
    setPreviewImage(null);
    setPreviewOtherImages([]);
    setIsEditing(false);
    setSubcategories([]);
    setNewSize('');
  };

  const handleAddSize = () => {
    const trimmedSize = newSize.trim();
    
    if (!trimmedSize) {
      setError('Please enter a size');
      return;
    }
    
    if (currentProduct.sizes.includes(trimmedSize)) {
      setError('This size already exists');
      return;
    }
    
    if (currentProduct.sizes.length >= 10) {
      setError('Maximum 10 sizes allowed');
      return;
    }
    
    setCurrentProduct({
      ...currentProduct,
      sizes: [...currentProduct.sizes, trimmedSize]
    });
    setNewSize('');
    setError(null);
  };

  const handleRemoveSize = (sizeToRemove) => {
    setCurrentProduct({
      ...currentProduct,
      sizes: currentProduct.sizes.filter(size => size !== sizeToRemove)
    });
  };

  const handleRemoveOtherImage = (indexToRemove) => {
    const newOtherImages = currentProduct.other_images.filter((_, index) => index !== indexToRemove);
    const newPreviewImages = previewOtherImages.filter((_, index) => index !== indexToRemove);
    
    setCurrentProduct({
      ...currentProduct,
      other_images: newOtherImages
    });
    setPreviewOtherImages(newPreviewImages);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.categoryName : 'Unknown';
  };

  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find(sub => sub._id === subcategoryId);
    return subcategory ? subcategory.subcategoryName : 'Unknown';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Product Management</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Product</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
            </th>
          </tr>
        </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category?.categoryName || getCategoryName(product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.subcategory?.subcategoryName || getSubcategoryName(product.subcategory)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit"
                >
                      <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                >
                      <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={currentProduct.productName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={currentProduct.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={currentProduct.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory *
                  </label>
                  <select
                    name="subcategory"
                    value={currentProduct.subcategory}
                    onChange={handleInputChange}
                    required
                    disabled={!currentProduct.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.subcategoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={currentProduct.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={currentProduct.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter stock quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sizes * <span className="text-red-500">({currentProduct.sizes.length}/10)</span>
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter size (e.g., S, M, L, XL)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                        maxLength={10}
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        disabled={!newSize.trim() || currentProduct.sizes.length >= 10}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    
                    {/* Size suggestions */}
                    <div className="text-xs text-gray-500">
                      Common sizes: 
                      <button 
                        type="button" 
                        onClick={() => setNewSize('S')} 
                        className="ml-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >S</button>
                      <button 
                        type="button" 
                        onClick={() => setNewSize('M')} 
                        className="ml-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >M</button>
                      <button 
                        type="button" 
                        onClick={() => setNewSize('L')} 
                        className="ml-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >L</button>
                      <button 
                        type="button" 
                        onClick={() => setNewSize('XL')} 
                        className="ml-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >XL</button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {currentProduct.sizes.map((size, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(size)}
                            className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1"
                            title="Remove size"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    {currentProduct.sizes.length === 0 && (
                      <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        At least one size is required
                      </div>
                    )}
                    
                    {currentProduct.sizes.length > 0 && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                        <i className="fas fa-check-circle mr-1"></i>
                        {currentProduct.sizes.length} size{currentProduct.sizes.length > 1 ? 's' : ''} added
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={currentProduct.color}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter color"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fabric *
                  </label>
                <input
                  type="text"
                    name="fabric"
                    value={currentProduct.fabric}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter fabric"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image * <span className="text-red-500">(Required)</span>
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    required={!isEditing} // Only required for new products
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    <p>• Select one image file (max 5MB)</p>
                    <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                    {isEditing && (
                      <p className="text-blue-600 font-medium">• Upload new image to replace existing one</p>
                    )}
                  </div>
                  
                  {/* Image Preview */}
                  {previewImage && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {isEditing ? 'New Image Preview:' : 'Image Preview:'}
                      </h4>
                      <div className="relative inline-block">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-32 h-32 object-fit rounded-lg border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Image validation feedback */}
                  {!currentProduct.image && !isEditing && (
                    <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200 mt-2">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Image is required
                    </div>
                  )}
                  
                  {currentProduct.image && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 mt-2">
                      <i className="fas fa-check-circle mr-1"></i>
                      Image selected
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Images <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    name="other_images"
                    onChange={handleInputChange}
                    accept="image/*"
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    <p>• Select multiple image files (max 5MB each)</p>
                    <p>• Maximum 10 additional images</p>
                    <p>• Supported formats: JPG, PNG, GIF, WebP</p>
                  </div>
                  
                  {/* Other Images Preview */}
                  {previewOtherImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Additional Images Preview:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {previewOtherImages.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-fit rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOtherImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Other images validation feedback */}
                  {currentProduct.other_images.length > 0 && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 mt-2">
                      <i className="fas fa-check-circle mr-1"></i>
                      {currentProduct.other_images.length} additional image{currentProduct.other_images.length > 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={currentProduct.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={currentProduct.tags.join(', ')}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={currentProduct.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={currentProduct.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Featured
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  <span>{isEditing ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addproduct;