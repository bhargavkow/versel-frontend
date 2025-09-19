import React, { useState, useEffect } from 'react';
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ, toggleFAQStatus, reorderFAQ } from '../services/faqService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faTimes, faCheck, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState({
    question: '',
    answer: '',
    displayOrder: 1,
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFAQs();
      setFaqs(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch FAQs: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentFAQ({
      ...currentFAQ,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    const nextOrder = faqs.length > 0 ? 
      Math.max(...faqs.map(faq => faq.displayOrder || 0)) + 1 : 1;
      
    setCurrentFAQ({
      question: '',
      answer: '',
      displayOrder: nextOrder,
      isActive: true
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate required fields
    if (!currentFAQ.question || !currentFAQ.answer) {
      setError('Please fill in all required fields (Question and Answer)');
      return;
    }
    
    try {
      if (isEditing) {
        await updateFAQ(currentFAQ._id, currentFAQ);
      } else {
        await createFAQ(currentFAQ);
      }
      
      fetchFAQs();
      setShowModal(false);
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (isEditing ? 'Failed to update FAQ' : 'Failed to create FAQ');
      setError(errorMessage);
    }
  };

  const handleEdit = (faq) => {
    setCurrentFAQ(faq);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFAQ(id);
        fetchFAQs();
      } catch (error) {
        setError('Failed to delete FAQ: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(faqs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the display order for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      displayOrder: index + 1
    }));

    setFaqs(updatedItems);

    // Send the updated order to the server
    try {
      for (const item of updatedItems) {
        await reorderFAQ(item._id, item.displayOrder);
      }
    } catch (err) {
      setError('Failed to update FAQ order');
      console.error('Error updating FAQ order:', err);
      fetchFAQs(); // Revert to original order on error
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await toggleFAQStatus(id);
      fetchFAQs();
    } catch (err) {
      setError('Failed to update FAQ status');
      console.error('Error updating FAQ status:', err);
    }
  };

  if (loading) return <div className="p-4">Loading FAQs...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage FAQs</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add New FAQ
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="faq-list" isDropDisabled={false}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {faqs.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No FAQs found. Add your first one!</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {faqs.map((faq, index) => (
                      <Draggable key={faq._id} draggableId={String(faq._id)} index={index}>
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
                              <div className="text-sm text-gray-900 max-w-xs truncate">{faq.question}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-md truncate">{faq.answer}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleActive(faq._id, faq.isActive)}
                                className={`px-3 py-1 rounded text-sm font-medium ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {faq.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(faq)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDelete(faq._id)}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{isEditing ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
                  Question *
                </label>
            <input
              type="text"
                  id="question"
              name="question"
              value={currentFAQ.question}
              onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="answer">
                  Answer *
                </label>
            <textarea
                  id="answer"
              name="answer"
              value={currentFAQ.answer}
              onChange={handleInputChange}
              rows="4"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
                />
          </div>
          
          <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayOrder">
                  Display Order
                </label>
            <input
              type="number"
                  id="displayOrder"
              name="displayOrder"
              value={currentFAQ.displayOrder}
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
                checked={currentFAQ.isActive}
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

export default FAQManagement;
