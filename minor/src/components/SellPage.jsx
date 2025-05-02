import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BookOpen, UploadCloud, CheckCircle, AlertTriangle, XCircle, Search, Upload, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define simple UI components (since we're not importing them)
const Button = ({ variant, size, onClick, className, children, disabled, ...props }) => {
  let baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  if (variant === "destructive") {
    baseClass += " bg-red-500 text-white hover:bg-red-600";
  } else { // Default to a filled button style
    baseClass += " bg-indigo-600 text-white hover:bg-indigo-700";
  }

  if (size === "sm") {
    baseClass += " px-3 py-1.5 text-sm";
  } else {
    baseClass += " px-4 py-2";
  }

  baseClass += ` ${className}`;
  if (disabled) {
    baseClass += " opacity-50 cursor-not-allowed";
  }

  return (
    <button onClick={onClick} className={baseClass} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className, ...props }) => (
  <input
    className={`w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-300 ${className}`}
    {...props}
  />
);

const Label = ({ htmlFor, className, children, ...props }) => (
  <label htmlFor={htmlFor} className={`block font-medium mb-1 text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

const Card = ({ className, children, ...props }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className, children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={`text-3xl font-bold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className, children, ...props }) => (
  <p className={`text-gray-600 text-lg ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const Alert = ({ variant, className, children, ...props }) => {
  let baseClass = "relative w-full rounded-lg border p-4";
  if (variant === "destructive") {
    baseClass += " bg-red-50 text-red-800 border-red-300";
  } else {
    baseClass += " bg-green-50 text-green-800 border-green-300";
  }
  return (
    <div className={baseClass + " " + className} {...props}>
      {children}
    </div>
  );
};

const AlertTitle = ({ className, children, ...props }) => (
  <h4 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h4>
);

const AlertDescription = ({ className, children, ...props }) => (
  <p className={`text-sm ${className}`} {...props}>
    {children}
  </p>
);

// Simple cn function (since we removed the import)
function cn(...args) {
  return args.filter(Boolean).join(' ');
}

const SellPage = ({ location, user }) => {
  const [formData, setFormData] = useState({
    bookName: '',
    yearOfPublish: '',
    originalPrice: '',
    sellPrice: '',
    location: location || '',
    seller: user?.username || '',
    image: null,
    catagory: '', // Kept the original typo to match backend expectations
    author: '',
    condition: '',
    description: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const conditions = ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'];
  const categories = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Romance', 'Biography', 'History', 'Self-Help', 'Children', 'Business', 'Cooking', 'Art', 'Travel'];

  useEffect(() => {
    if (location) {
      setFormData((prevData) => ({ ...prevData, location: location }));
    }
  }, [location]);

  const fetchBookSuggestions = async (query) => {
    if (!query || query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyBV9EUTVnpfKRpnkT5ZgQJKUp2O7oLGVuM`
      );
      console.log (response.data.items)
      if (response.data.items) {
        const books = response.data.items.map((item) => ({
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
          publishedDate: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate.split('-')[0] : 'Unknown',
          originalPrice: item.saleInfo?.listPrice?.amount || '',
        }));

        setSuggestions(books.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setErrorMessage('No suggestions found for this book name');
      }
    } catch (error) {
      console.error('Error fetching book suggestions:', error);
      setErrorMessage('Failed to fetch suggestions. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for category to match the original formData structure
    if (name === 'category') {
      setFormData({ ...formData, catagory: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === 'bookName') {
      const timeoutId = setTimeout(() => {
        fetchBookSuggestions(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    }

    if (name === 'sellPrice' && parseFloat(value) >= parseFloat(formData.originalPrice)) {
      setErrorMessage('Sell price should be less than the original price');
    } else {
      setErrorMessage('');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Store the actual file objects for upload
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs for display
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImagePreviews]);
    
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({
      ...formData,
      bookName: suggestion.title,
      yearOfPublish: suggestion.publishedDate,
      originalPrice: suggestion.originalPrice || '',
    });
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setFormData({
      bookName: '',
      yearOfPublish: '',
      originalPrice: '',
      sellPrice: '',
      location: location || '',
      seller: user?.username || '',
      image: null,
    });
    
    // Revoke object URLs to avoid memory leaks
    images.forEach(url => URL.revokeObjectURL(url));
    
    setImages([]);
    setImageFiles([]);
    setFormSubmitted(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sellPrice = parseFloat(formData.sellPrice);
    const originalPrice = parseFloat(formData.originalPrice);

    if (sellPrice >= originalPrice) {
      setErrorMessage('Sell price should be less than the original price');
      return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.post('https://book-share-backend-one.vercel.app/api/sell-book', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message === 'Book posted successfully!') {
        toast.success("Book uploaded successfully!");
        setFormSubmitted(true);
        setSuccessMessage('Book uploaded successfully!');
        setTimeout(() => {
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Error posting book:', error);
      toast.error("Failed to post book. Please try again later.");
      setErrorMessage('Failed to post book. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: 10 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Sell Your Books</h1>

      <Card className="bg-white rounded-lg shadow-md p-6">
        {formSubmitted ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Book Listed Successfully!</h2>
            <p className="text-gray-600 mb-6">Your book has been listed for sale. You can view and manage your listings in your profile.</p>
            <button
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
              onClick={resetForm}
            >
              List Another Book
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>{errorMessage}</p>
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Book Images</h2>
                  <p className="text-gray-600 text-sm mb-4">Upload clear images of your book. Include front cover, back cover, and any notable features.</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-1">Drag and drop or click to upload</p>
                      <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 5MB</p>
                    </label>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {images.map((src, index) => (
                        <div key={index} className="relative">
                          <img src={src} alt={`Book ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            onClick={() => {
                              setImages(images.filter((_, i) => i !== index));
                              setImageFiles(imageFiles.filter((_, i) => i !== index));
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">Selling Tips</h3>
                      <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
                        <li>Be honest about the condition of your book</li>
                        <li>Take clear, well-lit photos</li>
                        <li>Set a competitive price</li>
                        <li>Provide detailed descriptions</li>
                        <li>Respond promptly to buyer inquiries</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="bookName">Book Title <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="bookName"
                        type="text"
                        name="bookName"
                        value={formData.bookName}
                        onChange={handleChange}
                        required
                        placeholder="Enter book name"
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.ul
                            variants={suggestionVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
                          >
                            {suggestions.map((suggestion, index) => (
                              <li
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors text-sm"
                              >
                                {suggestion.title} ({suggestion.authors} - {suggestion.publishedDate})
                              </li>
                            ))}
                            {formData.bookName.trim() && (
                              <li
                                onClick={() => handleSuggestionClick({
                                  title: formData.bookName,
                                  publishedDate: '',
                                  authors: '',
                                  originalPrice: ''
                                })}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium"
                              >
                                Other: {formData.bookName}
                              </li>
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                    <Input
                      id="author"
                      type="text"
                      name="author"
                      onChange={handleChange}
                      required
                      placeholder="Enter author name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="yearOfPublish">Year of Publish</Label>
                    <Input
                      id="yearOfPublish"
                      type="number"
                      name="yearOfPublish"
                      value={formData.yearOfPublish}
                      onChange={handleChange}
                      placeholder="Enter year of publish"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.catagory}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition <span className="text-red-500">*</span></Label>
                    <select
                      id="condition"
                      name="condition"
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      required
                    >
                      <option value="">Select condition</option>
                      {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="originalPrice">Original Price <span className="text-red-500">*</span></Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      required
                      placeholder="Enter original price"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sellPrice">Sell Price <span className="text-red-500">*</span></Label>
                    <Input
                      id="sellPrice"
                      type="number"
                      name="sellPrice"
                      value={formData.sellPrice}
                      onChange={handleChange}
                      required
                      placeholder="Enter sell price"
                      className={errorMessage ? "border-red-500 focus:ring-red-500" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <Input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      disabled
                      placeholder="Location"
                      className="bg-gray-50 text-gray-900"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 h-32"
                    placeholder="Describe your book's condition, special features, etc."
                  />
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    className={`${isSubmitting ? 'bg-indigo-400' : 'bg-teal-600 hover:bg-teal-800'} text-white py-3 px-6 rounded-lg transition duration-300 w-full md:w-auto flex items-center justify-center gap-2`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Listing...'
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5" />
                        List Your Book
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default SellPage;