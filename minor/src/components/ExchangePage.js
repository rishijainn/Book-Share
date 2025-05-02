import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BookOpen, MapPin, Upload, RefreshCw } from 'lucide-react';

const ExchangePage = ({ location, user }) => {
  const [formData, setFormData] = useState({
    bookName: '',
    yearOfPublish: '',
    location: location,
    exchanger: user.username,
    image: null,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [exchangeBooks, setExchangeBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [requestingBooks, setRequestingBooks] = useState({});

  useEffect(() => {
    const fetchExchangeBooks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://book-share-backend-one.vercel.app/api/user-exchange-books/${user.username}`);
        console.log(response.data)
        const otherUsersBooks = response.data.filter(book => book.exchanger === user.username);
        console.log(otherUsersBooks)
        setExchangeBooks(otherUsersBooks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exchange books:", error.response?.data || error.message);
        setLoading(false);
      }
    };

    fetchExchangeBooks();

    return () => clearTimeout();
  }, [formData.bookName, user.username]);

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, location: location }));
  }, [location]);

  const fetchBookSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyCcc2XHsDlw9W6hN_IRAuQrJYPyqOPu9a8`
      );

      if (response.data.items) {
        const books = response.data.items.map((item) => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
          publishedDate: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate.split('-')[0] : 'Unknown',
          thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
        }));

        setSuggestions(books.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching book suggestions:', error);
      setErrorMessage('Failed to fetch suggestions. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'bookName') {
      fetchBookSuggestions(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    
    // Create image preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({
      ...formData,
      bookName: suggestion.title,
      yearOfPublish: suggestion.publishedDate,
    });
    setSelectedBookId(suggestion.id);
    setShowSuggestions(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!formData.bookName || !formData.yearOfPublish || !formData.image) {
      setErrorMessage('Please complete all fields before submitting.');
      return;
    }
  
    const exchangeFormData = new FormData();
    exchangeFormData.append('bookTitle', formData.bookName);
    exchangeFormData.append('exchanger', user.username);
    exchangeFormData.append('location', formData.location);
    exchangeFormData.append('image', formData.image);
  
    try {
      const response = await axios.post('https://book-share-backend-one.vercel.app/api/exchange-book', exchangeFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      setSuccessMessage('Exchange request submitted successfully!');
      setErrorMessage('');
      
      // Reset form
      setFormData({
        bookName: '',
        yearOfPublish: '',
        location: location,
        exchanger: user.username,
        image: null,
      });
      setImagePreview(null);
      setSelectedBookId(null);
  
      // Refresh book list - using the correct endpoint
      const booksResponse = await axios.get(`https://book-share-backend-one.vercel.app/api/user-exchange-books/${user.username}`);
      console.log(booksResponse);
      const otherUsersBooks = booksResponse.data.filter(book => book.exchanger !== user.username);
      setExchangeBooks(otherUsersBooks);
      
      toast.success('Your book has been added to the exchange list!');
    } catch (error) {
      console.error('Error posting exchange:', error.response?.data || error.message);
      setErrorMessage('Failed to post exchange. Please try again later.');
      setSuccessMessage('');
      toast.error('Failed to add your book. Please try again.');
    }
  };

  // Modified handleExchangeClick function with per-book loading state
  const handleExchangeClick = async (book) => {
    try {
      if (!book || !book._id) {
        console.error("Book data is incomplete:", book);
        toast.error('Book information is incomplete. Cannot proceed with exchange.');
        return;
      }

      // Set loading state for this specific book
      setRequestingBooks(prev => ({ ...prev, [book._id]: true }));

      const exchangeData = {
        bookId: book._id,
        exchanger: user.username,
        receiver: book.exchanger,
        location: book.location,
      };

      console.log("Sending exchange request with data:", exchangeData); // Debug log

      const response = await axios.post("https://book-share-backend-one.vercel.app/api/exchange-book-request", exchangeData);
      
      if (response.status === 200) {
        toast.success(`Exchange request for "${book.bookTitle}" sent successfully!`);
        // Update UI to reflect the change
        setExchangeBooks(prevBooks => 
          prevBooks.map(b => b._id === book._id ? {...b, requestStatus: 'pending', requestedBy: user.username} : b)
        );
      }
    } catch (error) {
      console.error("Error sending exchange request:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to send exchange request. Please try again later.');
    } finally {
      // Clear loading state for this specific book
      setRequestingBooks(prev => ({ ...prev, [book._id]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Book Exchange</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Panel - Add Book Form */}
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-800 p-4">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <BookOpen className="mr-2" size={24} />
              Share Your Book
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
              <div className="relative">
                <input
                  type="text"
                  name="bookName"
                  value={formData.bookName}
                  onChange={handleChange}
                  required
                  placeholder="Search for a book title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-grow">
                          <p className="font-medium">{suggestion.title}</p>
                          <p className="text-sm text-gray-600">
                            {suggestion.authors} • {suggestion.publishedDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Publication</label>
              <input
                type="number"
                name="yearOfPublish"
                value={formData.yearOfPublish}
                onChange={handleChange}
                required
                placeholder="e.g. 2022"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:from-gray-800 focus:border-from-gray-800 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="flex items-center">
                <MapPin className="text-gray-500 mr-2" size={18} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book Image</label>
              <div className="mt-1 flex items-center justify-center flex-col">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-all">
                  <Upload className="text-blue-500 mb-2" size={24} />
                  <span className="text-sm text-gray-600">Upload a photo of your book</span>
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    required
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                
                {imagePreview && (
                  <div className="mt-4 relative">
                    <img
                      src={imagePreview}
                      alt="Book preview"
                      className="h-48 w-auto object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <RefreshCw className="mr-2" size={18} />
              Add to Exchange
            </button>
          </form>
          
          {successMessage && (
            <div className="mx-6 mb-6 p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="mx-6 mb-6 p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg">
              {errorMessage}
            </div>
          )}
        </div>
        
        {/* Right Panel - Available Books */}
        <div className="w-full md:w-1/2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-800 p-4">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <BookOpen className="mr-2" size={24} />
              Available for Exchange
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : exchangeBooks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="mb-4 text-gray-400">
                  <BookOpen size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Books Available</h3>
                <p className="text-gray-500">There are currently no books available for exchange in your area.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {exchangeBooks.map((book) => (
                  <li key={book._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{book.bookTitle}</h3>
                          <div className="mt-2 flex items-center text-gray-600 text-sm">
                            <MapPin size={16} className="mr-1" />
                            <span>{book.location}</span> 
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Offered by: {book.exchanger}
                          </p>
                        </div>
                        <img
                          src="/api/placeholder/100/150"
                          alt="Book cover"
                          className="h-20 w-16 object-cover rounded shadow-sm"
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          className={`px-4 py-2 bg-teal-500 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center ${requestingBooks[book._id] ? 'opacity-75 cursor-not-allowed' : ''}`}
                          onClick={() => handleExchangeClick(book)}
                          disabled={requestingBooks[book._id]}
                        >
                          {requestingBooks[book._id] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            'Request Exchange'
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;