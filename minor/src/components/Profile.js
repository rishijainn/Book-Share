import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { User, Book, List, Settings, LogOut, Edit, Save, X, AlertCircle, Trash2, RefreshCw } from 'lucide-react';

const Profile = () => {
  // User state from localStorage
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  // State for navigation, edit mode, form data, books, errors, and success messages
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    mobileNumber: user?.mobileNumber || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });
  const [books, setBooks] = useState([]);
  const [exchangeBooks, setExchangeBooks] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [exchangeBooksLoading, setExchangeBooksLoading] = useState(false);

  // Redirect if no user is found
  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);

  // Fetch books posted by the user
  useEffect(() => {
    const fetchBooks = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await axios.get(
            `https://book-share-backend-one.vercel.app/api/user-books/${user.username}`
          );
          setBooks(response.data || []);
        } catch (error) {
          setError("Failed to fetch books. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBooks();
  }, [user]);

  // Fetch exchange books posted by the user
  useEffect(() => {
    const fetchExchangeBooks = async () => {
      if (user) {
        setExchangeBooksLoading(true);
        try {
          const response = await axios.get(
            `https://book-share-backend-one.vercel.app/api/user-exchange-books/${user.username}`
          );
          setExchangeBooks(response.data || []);
        } catch (error) {
          console.error("Error fetching exchange books:", error);
          toast.error("Failed to fetch exchange books.");
        } finally {
          setExchangeBooksLoading(false);
        }
      }
    };
    fetchExchangeBooks();
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enable editing
  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage("");
    setError("");
  };

  // Save updated profile
  const handleSaveClick = async () => {
    try {
      const response = await axios.put(
        `https://book-share-backend-one.vercel.app/api/user/${user.username}`,
        formData
      );
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Cancel editing
  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      username: user.username,
      email: user.email,
      mobileNumber: user.mobileNumber,
      bio: user?.bio || "",
      location: user?.location || "",
    });
  };

  // Delete a book
  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`https://book-share-backend-one.vercel.app/api/delete-book/${bookId}`);
      setBooks(books.filter((book) => book._id !== bookId));
      toast.success("Book removed successfully!");
    } catch (error) {
      setError("Failed to delete the book. Please try again.");
      toast.error("Failed to delete the book. Please try again.");
    }
  };

  // Delete an exchange book
  const handleDeleteExchangeBook = async (bookId) => {
    try {
      await axios.delete(`https://book-share-backend-one.vercel.app/api/exchange-books/${bookId}`);
      setExchangeBooks(exchangeBooks.filter((book) => book._id !== bookId));
      toast.success("Exchange book removed successfully!");
    } catch (error) {
      console.error("Error deleting exchange book:", error);
      toast.error("Failed to delete the exchange book. Please try again.");
    }
  };

  // Logout user
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = "/";
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">User Dashboard</h1>
      {/* Success message toast */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center" role="alert">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center" role="alert">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 sticky top-4">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
              <User className="h-8 w-8 text-indigo-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{user.username}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <nav>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className={`w-full flex items-center gap-3 p-3 rounded-md transition text-left ${
                      activeSection === 'profile'
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('listings')}
                    className={`w-full flex items-center gap-3 p-3 rounded-md transition text-left ${
                      activeSection === 'listings'
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <List className="h-5 w-5" />
                    <span>My Listings</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('exchange')}
                    className={`w-full flex items-center gap-3 p-3 rounded-md transition text-left ${
                      activeSection === 'exchange'
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Exchange Books</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('settings')}
                    className={`w-full flex items-center gap-3 p-3 rounded-md transition text-left ${
                      activeSection === 'settings'
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </li>
                <li className="pt-2 mt-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-md transition text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
                  {user.createdAt && <p className="text-gray-500 text-sm mt-1">Joined {formatDate(user.createdAt)}</p>}
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveClick}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      ></textarea>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p className="mt-1 text-lg text-gray-800">{user.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-lg text-gray-800">{user.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                        <p className="mt-1 text-lg text-gray-800">{user.mobileNumber || "Not provided"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="mt-1 text-lg text-gray-800">{user.location || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                      <p className="mt-1 text-gray-800">{user.bio || "No bio provided."}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Listings Section */}
          {activeSection === 'listings' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">Your Book Listings</h2>
                <p className="text-gray-500 mt-1">Manage your books for sale</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading your books...</p>
                  </div>
                ) : books.length === 0 ? (
                  <div className="text-center py-8">
                    <Book className="h-16 w-16 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-600">You haven't listed any books for sale yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                      <div key={book._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group">
                        {book.imageUrl ? (
                          <div className="h-48 overflow-hidden bg-gray-100">
                            <img
                              src={`https://book-share-backend-one.vercel.app/${book.imageUrl}`}
                              alt={book.bookName}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <Book className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-lg text-gray-800">{book.bookName}</h3>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="text-gray-400 hover:text-red-500 transition"
                              title="Delete book"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>Year: {book.yearOfPublish}</p>
                            <p>Location: {book.location}</p>
                            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                              <span className="text-gray-500">Original: ₹{book.originalPrice}</span>
                              <span className="font-medium text-lg text-indigo-600">₹{book.sellPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Exchange Books Section */}
          {activeSection === 'exchange' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">Your Exchange Books</h2>
                <p className="text-gray-500 mt-1">Books you've listed for exchange</p>
              </div>
              <div className="p-6">
                {exchangeBooksLoading ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading your exchange books...</p>
                  </div>
                ) : exchangeBooks.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-16 w-16 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-600">You haven't listed any books for exchange yet.</p>
                    <button 
                      onClick={() => window.location.href = "/add-exchange-book"} 
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                      Add Exchange Book
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exchangeBooks.map((book) => (
                      <div key={book._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group">
                        {book.imageUrl ? (
                          <div className="h-48 overflow-hidden bg-gray-100">
                            <img
                              src={`https://book-share-backend-one.vercel.app/${book.imageUrl}`}
                              alt={book.bookName}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <Book className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-lg text-gray-800">{book.bookName}</h3>
                            <button
                              onClick={() => handleDeleteExchangeBook(book._id)}
                              className="text-gray-400 hover:text-red-500 transition"
                              title="Delete exchange book"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>Author: {book.author}</p>
                            <p>Year: {book.yearOfPublish}</p>
                            <p>Condition: {book.condition}</p>
                            <p>Location: {book.location}</p>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available for Exchange
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">Account Settings</h2>
                <p className="text-gray-500 mt-1">Manage your account preferences</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Settings functionality is currently under development. Check back soon for updates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;