import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes, faCheck, faToggleOn, faToggleOff, faFilter } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../config';

const SubcategoryManager = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentSubcategory, setCurrentSubcategory] = useState({
        subcategoryName: '',
        description: '',
        category: '',
        isActive: true,
        order: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const API_URL = process.env.REACT_APP_API_URL || 'https://vercel-backend-seven.vercel.app';
    
    // Try alternative API URLs if the default fails
    const API_URLS = [
        API_URL,
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://192.168.1.11:5000'
    ];
    
    const fetchData = async () => {
        let lastError = null;
        
        for (const url of API_URLS) {
            try {
                setLoading(true);
                setError(null);
                
                console.log(`Trying API URL: ${url}`);
                
                const [subcategoriesRes, categoriesRes] = await Promise.all([
                    axios.get(`${url}/api/subcategories`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        }
                    }),
                    axios.get(`${url}/api/categories`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        }
                    })
                ]);
                
                console.log('Subcategories response:', subcategoriesRes.data);
                console.log('Categories response:', categoriesRes.data);
                
                // Handle different response structures
                const subcategoriesData = subcategoriesRes.data.success ? subcategoriesRes.data.data : subcategoriesRes.data;
                const categoriesData = categoriesRes.data.success ? categoriesRes.data.data : categoriesRes.data;
                
                setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                setLoading(false);
                return; // Success, exit the loop
                
            } catch (err) {
                console.error(`Error with API URL ${url}:`, err);
                lastError = err;
                continue; // Try next URL
            }
        }
        
        // If all URLs failed
        console.error('All API URLs failed:', lastError);
        setError(`Failed to load data from all API endpoints: ${lastError?.response?.data?.message || lastError?.message}`);
        setLoading(false);
    };

    const fetchSubcategoriesByCategory = async (categoryId) => {
        try {
            const response = await axios.get(`${API_URL}/api/subcategories/category/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                }
            });
            
            console.log('Subcategories by category response:', response.data);
            
            // Handle different response structures
            const subcategoriesData = response.data.success ? response.data.data : response.data;
            setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
        } catch (err) {
            console.error('Error fetching subcategories by category:', err);
            setSubcategories([]);
        }
    };

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId);
        if (categoryId === 'all') {
            fetchData();
        } else {
            fetchSubcategoriesByCategory(categoryId);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentSubcategory({
            ...currentSubcategory,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const subcategoryData = {
                subcategoryName: currentSubcategory.subcategoryName,
                description: currentSubcategory.description,
                category: currentSubcategory.category,
                isActive: currentSubcategory.isActive,
                order: parseInt(currentSubcategory.order) || 0
            };

            console.log('Submitting subcategory data:', subcategoryData);

            if (isEditing) {
                const response = await axios.put(`${API_URL}/api/subcategories/${currentSubcategory._id}`, subcategoryData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Update response:', response.data);
            } else {
                const response = await axios.post(`${API_URL}/api/subcategories`, subcategoryData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Create response:', response.data);
            }
            
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error('Error saving subcategory:', err);
            setError(`${isEditing ? 'Failed to update subcategory' : 'Failed to create subcategory'}: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleEdit = (subcategory) => {
        setCurrentSubcategory({
            _id: subcategory._id,
            subcategoryName: subcategory.subcategoryName,
            description: subcategory.description,
            category: subcategory.category._id || subcategory.category,
            isActive: subcategory.isActive,
            order: subcategory.order
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subcategory? This will also delete all associated products.')) {
            try {
                await axios.delete(`${API_URL}/api/subcategories/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    }
                });
                fetchData();
            } catch (err) {
                setError('Failed to delete subcategory');
                console.error('Error deleting subcategory:', err);
            }
        }
    };

    const handleToggleActive = async (subcategory) => {
        try {
            await axios.patch(`${API_URL}/api/subcategories/${subcategory._id}/toggle`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                }
            });
            fetchData();
        } catch (err) {
            setError('Failed to toggle subcategory status');
            console.error('Error toggling subcategory:', err);
        }
    };

    const resetForm = () => {
        setCurrentSubcategory({
            subcategoryName: '',
            description: '',
            category: '',
            isActive: true,
            order: subcategories.length
        });
        setIsEditing(false);
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
                <h2 className="text-3xl font-bold text-gray-800">Subcategory Management</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Add Subcategory</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Category Filter */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-4">
                    <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
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
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subcategory Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subcategories.map((subcategory) => (
                                <tr key={subcategory._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {subcategory.order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {subcategory.subcategoryName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {subcategory.category?.categoryName || getCategoryName(subcategory.category)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {subcategory.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            subcategory.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {subcategory.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleToggleActive(subcategory)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                subcategory.isActive 
                                                    ? 'text-green-600 hover:bg-green-100' 
                                                    : 'text-red-600 hover:bg-red-100'
                                            }`}
                                            title={subcategory.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <FontAwesomeIcon icon={subcategory.isActive ? faToggleOn : faToggleOff} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(subcategory)}
                                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Edit"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subcategory._id)}
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={currentSubcategory.category}
                                    onChange={handleInputChange}
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
                                    Subcategory Name *
                                </label>
                                <input
                                    type="text"
                                    name="subcategoryName"
                                    value={currentSubcategory.subcategoryName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter subcategory name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={currentSubcategory.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter subcategory description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={currentSubcategory.order}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Display order"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={currentSubcategory.isActive}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Active
                                </label>
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

export default SubcategoryManager;
