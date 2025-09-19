import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes, faCheck, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({
        categoryName: '',
        description: '',
        isActive: true,
        order: 0
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/categories`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                }
            });
            setCategories(response.data.data || response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load categories');
            setLoading(false);
            console.error('Error fetching categories:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCategory({
            ...currentCategory,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const categoryData = {
                categoryName: currentCategory.categoryName,
                description: currentCategory.description,
                isActive: currentCategory.isActive,
                order: parseInt(currentCategory.order) || 0
            };

            if (isEditing) {
                await axios.put(`${API_URL}/api/categories/${currentCategory._id}`, categoryData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.post(`${API_URL}/api/categories`, categoryData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            
            fetchCategories();
            setShowModal(false);
            resetForm();
        } catch (err) {
            setError(isEditing ? 'Failed to update category' : 'Failed to create category');
            console.error('Error saving category:', err);
        }
    };

    const handleEdit = (category) => {
        setCurrentCategory({
            _id: category._id,
            categoryName: category.categoryName,
            description: category.description,
            isActive: category.isActive,
            order: category.order
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This will also delete all associated subcategories and products.')) {
            try {
                await axios.delete(`${API_URL}/api/categories/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    }
                });
                fetchCategories();
            } catch (err) {
                setError('Failed to delete category');
                console.error('Error deleting category:', err);
            }
        }
    };

    const handleToggleActive = async (category) => {
        try {
            await axios.patch(`${API_URL}/api/categories/${category._id}/toggle`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                }
            });
            fetchCategories();
        } catch (err) {
            setError('Failed to toggle category status');
            console.error('Error toggling category:', err);
        }
    };

    const resetForm = () => {
        setCurrentCategory({
            categoryName: '',
            description: '',
            isActive: true,
            order: categories.length
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
                <h2 className="text-3xl font-bold text-gray-800">Category Management</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Add Category</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subcategories
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {category.order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {category.categoryName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {category.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            category.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {category.subcategories ? category.subcategories.length : 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleToggleActive(category)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                category.isActive 
                                                    ? 'text-green-600 hover:bg-green-100' 
                                                    : 'text-red-600 hover:bg-red-100'
                                            }`}
                                            title={category.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <FontAwesomeIcon icon={category.isActive ? faToggleOn : faToggleOff} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Edit"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
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
                                {isEditing ? 'Edit Category' : 'Add New Category'}
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
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="categoryName"
                                    value={currentCategory.categoryName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter category name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={currentCategory.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter category description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={currentCategory.order}
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
                                    checked={currentCategory.isActive}
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

export default CategoryManager;