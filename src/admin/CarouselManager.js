import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes, faCheck, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const CarouselManager = () => {
    const [carouselImages, setCarouselImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentImage, setCurrentImage] = useState({
        title: '',
        imageFile: null,
        description: '',
        linkUrl: '',
        isActive: true,
        order: 1
    });
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchCarouselImages();
    }, []);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    const fetchCarouselImages = async () => {
        try {
            setLoading(true);
            console.log('Fetching carousel images...');
            const response = await axios.get(`${API_URL}/api/carousels`);
            console.log('Carousel response:', response.data);
            if (response.data && response.data.success) {
                setCarouselImages(response.data.data);
                setError(null);
            } else {
                setCarouselImages([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching carousel images:', err);
            setError('Failed to load carousel images: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            setCurrentImage({
                ...currentImage,
                imageFile: file
            });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setCurrentImage({
                ...currentImage,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setError(null);
        
        // Validate required fields
        if (!currentImage.title || !currentImage.description) {
            setError('Please fill in all required fields (Title and Description)');
            return;
        }
        
        // Check if image file is provided (only for new images, not when editing)
        if (!isEditing && !currentImage.imageFile) {
            setError('Please upload an image file');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('title', currentImage.title);
            formData.append('description', currentImage.description);
            formData.append('link', currentImage.linkUrl && currentImage.linkUrl !== '#' ? currentImage.linkUrl : '');
            formData.append('isActive', currentImage.isActive);
            formData.append('order', parseInt(currentImage.order) || 1);
            
            // Handle file upload - ONLY send file if provided
            if (currentImage.imageFile) {
                formData.append('image', currentImage.imageFile);
            }
            
            if (isEditing) {
                await axios.put(`${API_URL}/api/carousels/${currentImage._id}`, formData);
            } else {
                await axios.post(`${API_URL}/api/carousels`, formData);
            }
            fetchCarouselImages();
            setShowModal(false);
            resetForm();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 
                               (isEditing ? 'Failed to update carousel image' : 'Failed to create carousel image');
            setError(errorMessage);
            console.error('Error saving carousel image:', err);
            console.error('Error response:', err.response?.data);
        }
    };

    const handleEdit = (image) => {
        setCurrentImage({
            ...image,
            imageFile: null, // Clear file when editing
            linkUrl: image.link || '' // Ensure link is properly set
        });
        setIsEditing(true);
        setShowModal(true);
        setPreviewImage(''); // Clear preview when editing existing image
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carousel image?')) {
            try {
                await axios.delete(`${API_URL}/api/carousels/${id}`);
                fetchCarouselImages();
            } catch (err) {
                setError('Failed to delete carousel image');
                console.error('Error deleting carousel image:', err);
            }
        }
    };

    const resetForm = () => {
        const nextOrder = carouselImages.length > 0 ? 
            Math.max(...carouselImages.map(img => img.order || 0)) + 1 : 1;
            
        setCurrentImage({
            title: '',
            imageFile: null,
            description: '',
            linkUrl: '',
            isActive: true,
            order: nextOrder
        });
        setPreviewImage('');
        setIsEditing(false);
    };

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(carouselImages);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update the order property for each item
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setCarouselImages(updatedItems);

        // Send the updated order to the server
        try {
            for (const item of updatedItems) {
                await axios.patch(`${API_URL}/api/carousels/${item._id}/reorder`, {
                    newOrder: item.order
                });
            }
        } catch (err) {
            setError('Failed to update carousel order');
            console.error('Error updating carousel order:', err);
            fetchCarouselImages(); // Revert to original order on error
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await axios.patch(`${API_URL}/api/carousels/${id}/toggle-status`, {});
            fetchCarouselImages();
        } catch (err) {
            setError('Failed to update carousel image status');
            console.error('Error updating carousel image status:', err);
        }
    };

    if (loading) return <div className="p-4">Loading carousel images...</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Carousel Images</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add New Image
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="carousel-images" isDropDisabled={false}>
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="bg-white rounded-lg shadow overflow-hidden"
                        >
                            {carouselImages.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No carousel images found. Add your first one!</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {carouselImages.map((image, index) => (
                                            <Draggable key={image._id} draggableId={String(image._id)} index={index}>
                                                {(provided) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className="text-sm text-gray-900">{index + 1}</span>
                                                                <div className="ml-2 flex flex-col">
                                                                    <FontAwesomeIcon icon={faArrowUp} className="text-gray-400 cursor-pointer hover:text-gray-700 text-xs" />
                                                                    <FontAwesomeIcon icon={faArrowDown} className="text-gray-400 cursor-pointer hover:text-gray-700 text-xs mt-1" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img 
                                                src={image.image.startsWith('http') ? image.image : `${API_URL}${image.image}`} 
                                                alt={image.title} 
                                                className="h-16 w-24 object-cover rounded" 
                                                onError={(e) => {
                                                    console.error('Image failed to load:', image.image);
                                                    e.target.src = `${API_URL}/uploads/fallback-carousel.jpg`;
                                                    e.target.onerror = null; // Prevent infinite loop
                                                }}
                                            />
                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{image.title}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">{image.link}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => toggleActive(image._id, image.isActive)}
                                                                className={`px-3 py-1 rounded text-sm font-medium ${image.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                            >
                                                                {image.isActive ? 'Active' : 'Inactive'}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => handleEdit(image)}
                                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(image._id)}
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
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{isEditing ? 'Edit Carousel Image' : 'Add New Carousel Image'}</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={currentImage.title}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                                    Upload Image File {!isEditing ? '*' : '(Optional)'}
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required={!isEditing}
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
                                    Upload an image file from your computer (JPG, PNG, etc.) - {!isEditing ? 'Required' : 'Optional (leave empty to keep current image)'}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={currentImage.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkUrl">
                                    Link URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="linkUrl"
                                    name="linkUrl"
                                    value={currentImage.linkUrl}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="https://example.com (leave empty for no link)"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Must start with http:// or https:// if provided
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order">
                                    Order
                                </label>
                                <input
                                    type="number"
                                    id="order"
                                    name="order"
                                    value={currentImage.order}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>

                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={currentImage.isActive}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <label className="text-gray-700 text-sm font-bold" htmlFor="isActive">
                                    Active
                                </label>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    {isEditing ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarouselManager;