import React, { useState, useEffect } from "react";
import axios from "axios";

const PurchasePage = ({ user }) => {
  const [availableBooks, setAvailableBooks] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  // New state for category filtering
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // New state for grouping
  const [groupingOption, setGroupingOption] = useState("Category");
  const [activeGroup, setActiveGroup] = useState("All");

  // Extract unique categories
  const extractCategories = (books) => {
    const categories = books.reduce((acc, book) => {
      const category = book.catagory || 'Uncategorized';
      if (!acc.includes(category)) {
        acc.push(category);
      }
      return acc;
    }, ['All']);
    
    return categories;
  };

  // Filter books by selected category
  const filterBooksByCategory = (books) => {
    if (selectedCategory === "All") return books;
    return books.filter(book => 
      (book.catagory || 'Uncategorized') === selectedCategory
    );
  };

  // Advanced Grouping Function
  const groupBooks = (books) => {
    // Filter books by category first
    const filteredBooks = filterBooksByCategory(books);

    const groupings = {
      "Category": () => {
        // Dynamically create categories
        const categories = {
          "All": filteredBooks,
          ...filteredBooks.reduce((acc, book) => {
            const category = book.catagory || 'Uncategorized';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(book);
            return acc;
          }, {})
        };
        return categories;
      },
      "Price Range": () => {
        const priceRanges = {
          "All": filteredBooks,
          "Budget (0-500)": filteredBooks.filter(book => book.sellPrice <= 500),
          "Mid-Range (501-1000)": filteredBooks.filter(book => book.sellPrice > 500 && book.sellPrice <= 1000),
          "Premium (1001+)": filteredBooks.filter(book => book.sellPrice > 1000)
        };
        return priceRanges;
      },
      "Publication Year": () => {
        // Group by decade
        const yearGroups = {
          "All": filteredBooks,
          ...filteredBooks.reduce((acc, book) => {
            const decade = Math.floor(book.yearOfPublish / 10) * 10;
            const decadeKey = `${decade}s`;
            if (!acc[decadeKey]) {
              acc[decadeKey] = [];
            }
            acc[decadeKey].push(book);
            return acc;
          }, {})
        };
        return yearGroups;
      },
      "Location": () => {
        const locations = {
          "All": filteredBooks,
          ...filteredBooks.reduce((acc, book) => {
            const location = book.location || 'Unknown';
            if (!acc[location]) {
              acc[location] = [];
            }
            acc[location].push(book);
            return acc;
          }, {})
        };
        return locations;
      }
    };

    return groupings[groupingOption]();
  };

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://book-share-backend2.vercel.app/api/purchase-books/${user.username}`
        );
        console.log(response.data)
        setAvailableBooks(response.data);
        setActiveGroup("All"); // Reset active group when books are fetched
        setSelectedCategory("All"); // Reset category filter
      } catch (error) {
        console.error("Error fetching books:", error);
        setFetchError("Failed to fetch books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user]);

  // Handle Book Selection
  const handleSelectBook = (book) => {
    console.log("Book selected:", book);
    setSelectedBook(book);
    setOrderStatus(""); // Clear previous order status on new selection
  };

  // Handle Book Purchase
  const handleBuyBook = async () => {
    if (!selectedBook) {
      setOrderStatus("Please select a book to buy.");
      return;
    }

    setPurchaseLoading(true); // Start loading state
    setOrderStatus(""); // Clear previous status

    try {
      console.log("Sending purchase request for book:", selectedBook);
      await axios.post(
        `https://book-share-backend2.vercel.app/api/buy-book`,
        {
          user: user.username,
          bookId: selectedBook._id,
        }
      );

      setOrderStatus("Your book order has been placed!");
      setSelectedBook(null); // Clear selection after successful order
    } catch (error) {
      console.error("Error purchasing book:", error);
      setOrderStatus("Failed to place your order. Please try again.");
    } finally {
      setPurchaseLoading(false); // End loading state
    }
  };

  // Define simple UI components (since we're not importing them)
  const Button = ({ variant, size, onClick, className, children, disabled, ...props }) => {
    let baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    if (variant === "destructive") {
      baseClass += " bg-red-500 text-white hover:bg-red-600";
    } else { // Default to a filled button style
      baseClass += " bg-blue-500 text-white hover:bg-blue-600";
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

  const Card = ({ className, children, ...props }) => (
    <div className={`bg-white rounded-md shadow ${className}`} {...props}>
      {children}
    </div>
  );

  const CardHeader = ({ className, children, ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );

  const CardTitle = ({ className, children, ...props }) => (
    <h3 className={`text-2xl font-semibold ${className}`} {...props}>
      {children}
    </h3>
  );

  const CardDescription = ({ className, children, ...props }) => (
    <p className={`text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );

  const CardContent = ({ className, children, ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );

  const Alert = ({ variant, className, children, ...props }) => {
    let baseClass = "relative w-full rounded-md border p-4";
    if (variant === "destructive") {
      baseClass += " bg-red-100 text-red-800 border-red-300";
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

  // Spinner/Loader component
  const Spinner = ({ size = "md", className = "" }) => {
    let sizeClass = "w-6 h-6";
    if (size === "sm") sizeClass = "w-4 h-4";
    if (size === "lg") sizeClass = "w-8 h-8";
    
    return (
      <div className={`${sizeClass} ${className} inline-block`}>
        <svg 
          className="animate-spin text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  };

  // Simple cn function (since we removed the import)
  function cn(...args) {
    return args.filter(Boolean).join(' ');
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">Available Books for Purchase</h1>

      {/* Category Dropdown */}
      <div className="mb-4 flex items-center space-x-4">
        <label htmlFor="category-select" className="font-medium text-gray-700">
          Filter by Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setActiveGroup("All"); // Reset active group when category changes
          }}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {extractCategories(availableBooks).map((category) => (
            <option key={category} value={category}>
              {category} ({availableBooks.filter(book => 
                (book.catagory || 'Uncategorized') === category
              ).length})
            </option>
          ))}
        </select>
      </div>

      {/* Grouping Options Selector */}
      {/* <div className="mb-4 flex items-center space-x-4">
        <label className="font-medium text-gray-700">Group By:</label>
        <div className="flex space-x-2">
          {["Category", "Price Range", "Publication Year", "Location"].map((option) => (
            <Button
              key={option}
              variant={groupingOption === option ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setGroupingOption(option);
                setActiveGroup("All");
              }}
              className={`
                ${groupingOption === option 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-700 border border-gray-300"}
                hover:bg-blue-100 whitespace-nowrap
              `}
            >
              {option}
            </Button>
          ))}
        </div>
      </div> */}

      {/* Group Tabs */}
      {/* <div className="flex mb-6 space-x-2 border-b pb-2 overflow-x-auto">
        {Object.keys(groupBooks(availableBooks)).map(group => (
          <Button
            key={group}
            variant={activeGroup === group ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveGroup(group)}
            className={`
              ${activeGroup === group 
                ? "bg-green-500 text-white" 
                : "bg-white text-gray-700 border border-gray-300"}
              hover:bg-green-100 whitespace-nowrap
            `}
          >
            {group} ({groupBooks(availableBooks)[group].length})
          </Button>
        ))}
      </div> */}

      {/* Book Rendering */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" className="text-blue-500 mb-4" />
          <p className="text-gray-600 text-lg">Loading books...</p>
        </div>
      ) : filterBooksByCategory(availableBooks).length === 0 ? (
        <p className="text-gray-600">No books available in the selected category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupBooks(availableBooks)[activeGroup].map((book) => (
            <Card
              key={book._id}
              className={cn(
                "transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg",
                selectedBook?._id === book._id && "ring-2 ring-blue-500 ring-offset-2"
              )}
              onClick={() => handleSelectBook(book)}
              style={{ cursor: 'pointer' }}
            >
              {book.imageUrl && (
                <div className="relative aspect-w-16 aspect-h-9">
                  <img
                    src={`https://book-share-backend2.vercel.app/${book.imageUrl}`}
                    alt={book.bookName}
                    className="object-cover rounded-t-md w-full h-full"
                  />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {book.bookName}
                </CardTitle>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <strong>Category:</strong> {book.catagory || 'Uncategorized'}
                  </p>
                  <p className="text-gray-600">
                    <strong>Year of Publish:</strong> {book.yearOfPublish}
                  </p>
                  <p className="text-gray-600">
                    <strong>Original Price:</strong> Rs. {book.originalPrice}
                  </p>
                  <p className="text-gray-600">
                    <strong>Sell Price:</strong> Rs. {book.sellPrice}
                  </p>
                  <p className="text-gray-600">
                    <strong>Location:</strong> {book.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Buy Book Button */}
      <div className="mt-8 flex items-center gap-4">
        <Button
          onClick={handleBuyBook}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md shadow-md transition-colors duration-200"
          disabled={!selectedBook || purchaseLoading}
        >
          {purchaseLoading ? (
            <>
              <Spinner size="sm" className="mr-2 text-white" />
              Processing...
            </>
          ) : (
            "Buy Book"
          )}
        </Button>
        {orderStatus && (
          <p
            className={cn(
              "text-lg font-medium",
              orderStatus.startsWith("Your")
                ? "text-green-600"
                : "text-red-600"
            )}
          >
            {orderStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default PurchasePage;