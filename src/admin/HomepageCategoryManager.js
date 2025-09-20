import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes, faCheck, faArrowUp, faArrowDown, faHome } from '@fortawesome/free-solid-svg-icons';

const HomepageCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({
        name: '',
        description: '',
        image: '',
        imageFile: null,
        displayOnHome: true,
        homepageOrder: 1,
        linkTo: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const API_URL = process.env.REACT_APP_API_URL || 'https://stylehub-backend-nu.vercel.app';
    
    const fetchCategories = async () => {
        try {
            setLoading(true);
            console.log('Fetching homepage categories...');
            const response = await axios.get(`${API_URL}/api/homepage-categories`);
            console.log('Homepage categories response:', response.data);
            if (response.data && response.data.success) {
                setCategories(response.data.data);
                setError(null);
            } else {
                setCategories([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching homepage categories:', err);
            setError('Failed to load homepage categories: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            setCurrentCategory({
                ...currentCategory,
                imageFile: file
            });
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        } else if (type === 'checkbox') {
            setCurrentCategory({
                ...currentCategory,
                [name]: checked
            });
        } else {
            setCurrentCategory({
                ...currentCategory,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentCategory.name || !currentCategory.description) {
            setError('Please fill in all required fields (Name and Description)');
            return;
        }
        
        // Check if image is provided
        if (!currentCategory.imageFile && !currentCategory.image) {
            setError('Please provide either an image file or image URL');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('name', currentCategory.name);
            formData.append('description', currentCategory.description);
            formData.append('displayOnHome', currentCategory.displayOnHome);
            formData.append('homepageOrder', parseInt(currentCategory.homepageOrder) || 1);
            formData.append('linkTo', currentCategory.linkTo || '');
            
            // Handle file upload or image URL
            if (currentCategory.imageFile) {
                formData.append('image', currentCategory.imageFile);
            } else if (currentCategory.image) {
                formData.append('image', currentCategory.image);
            }
            
            if (isEditing) {
                await axios.put(`${API_URL}/api/homepage-categories/${currentCategory._id}`, formData);
            } else {
                await axios.post(`${API_URL}/api/homepage-categories`, formData);
            }
            fetchCategories();
            setShowModal(false);
            resetForm();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error ||
                               (isEditing ? 'Failed to update homepage category' : 'Failed to create homepage category');
            setError(errorMessage);
            console.error('Error saving homepage category:', err);
            console.error('Error response:', err.response?.data);
        }
    };

    const handleEdit = (category) => {
        setCurrentCategory({
            _id: category._id,
            name: category.name,
            description: category.description,
            image: category.image,
            imageFile: null,
            displayOnHome: category.displayOnHome,
            homepageOrder: category.homepageOrder,
            linkTo: category.linkTo || ''
        });
        setIsEditing(true);
        setShowModal(true);
        setPreviewImage(''); // Clear preview when editing existing image
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this homepage category?')) {
            try {
                await axios.delete(`${API_URL}/api/homepage-categories/${id}`);
                fetchCategories();
            } catch (err) {
                setError('Failed to delete homepage category');
                console.error('Error deleting homepage category:', err);
            }
        }
    };

    const handleAddNew = () => {
        resetForm();
        setIsEditing(false);
        setShowModal(true);
    };

    const resetForm = () => {
        setCurrentCategory({
            name: '',
            description: '',
            image: '',
            imageFile: null,
            displayOnHome: true,
            homepageOrder: 1,
            linkTo: ''
        });
        setPreviewImage('');
        setError(null);
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately
        const updatedItems = items.map((item, index) => ({
            ...item,
            homepageOrder: index + 1
        }));
        setCategories(updatedItems);

        // Send the updated order to the server
        try {
            for (const item of updatedItems) {
                await axios.patch(`${API_URL}/api/homepage-categories/${item._id}/reorder`, {
                    newOrder: item.homepageOrder
                });
            }
        } catch (err) {
            setError('Failed to update category order');
            console.error('Error updating category order:', err);
            fetchCategories(); // Revert to original order on error
        }
    };

    const toggleDisplayOnHome = async (id, currentStatus) => {
        try {
            await axios.patch(`${API_URL}/api/homepage-categories/${id}/toggle-display`, {});
            fetchCategories();
        } catch (err) {
            setError('Failed to update category display status');
            console.error('Error updating category display status:', err);
        }
    };

    if (loading) return <div className="p-4">Loading homepage categories...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Homepage Categories</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add New Category
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="homepage-categories" isDropDisabled={false}>
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.map((category, index) => (
                                            <Draggable key={category._id} draggableId={String(category._id)} index={index}>
                                                {(provided, snapshot) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`${snapshot.isDragging ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-sm font-medium text-gray-900">{category.homepageOrder}</span>
                                                                <div className="flex flex-col">
                                                                    <FontAwesomeIcon icon={faArrowUp} className="text-gray-400 cursor-pointer hover:text-gray-700 text-xs mb-1" />
                                                                    <FontAwesomeIcon icon={faArrowDown} className="text-gray-400 cursor-pointer hover:text-gray-700 text-xs mt-1" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <img 
                                                                src={category.image.startsWith('http') ? category.image : `${API_URL}${category.image}`} 
                                                                alt={category.name} 
                                                                className="h-16 w-24 object-fit rounded" 
                                                                onError={(e) => {
                                                                    console.error('Image failed to load:', category.image);
                                                                    e.target.src = '/images/fallback-category.jpg';
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{category.name}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900 max-w-xs truncate">{category.description}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{category.linkTo || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => toggleDisplayOnHome(category._id, category.displayOnHome)}
                                                                className={`px-2 py-1 text-xs rounded-full ${
                                                                    category.displayOnHome 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {category.displayOnHome ? 'Yes' : 'No'}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleEdit(category)}
                                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(category._id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {isEditing ? 'Edit Homepage Category' : 'Add New Homepage Category'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={currentCategory.name}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                                        Upload Image File (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        name="imageFile"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                    {previewImage && (
                                        <div className="mt-2">
                                            <img 
                                                src={previewImage} 
                                                alt="Preview" 
                                                className="h-32 object-fit rounded"
                                            />
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload an image file from your computer (JPG, PNG, etc.)
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                                        Image URL (Optional - if no file uploaded)
                                    </label>
                                    <input
                                        type="text"
                                        id="imageUrl"
                                        name="image"
                                        value={currentCategory.image}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Provide an image URL if you don't want to upload a file
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={currentCategory.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkTo">
                                        Link To (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="linkTo"
                                        name="linkTo"
                                        value={currentCategory.linkTo}
                                        onChange={handleInputChange}
                                        placeholder="/category/electronics"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="homepageOrder">
                                        Homepage Order
                                    </label>
                                    <input
                                        type="number"
                                        id="homepageOrder"
                                        name="homepageOrder"
                                        value={currentCategory.homepageOrder}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="displayOnHome"
                                            checked={currentCategory.displayOnHome}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Display on Homepage</span>
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        {isEditing ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageCategoryManager;
