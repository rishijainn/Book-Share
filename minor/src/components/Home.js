import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Repeat, DollarSign, MessageCircle } from 'lucide-react';

const HomePage = () => {
  const [loggedInUser,setLoggedInuser]=useState(null);
  useEffect(()=>{
    const User = localStorage.getItem('user');
    setLoggedInuser(User)
  })
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Gateway to a World of Books
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Buy, sell, and borrow books with ease. Join our community of book lovers today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {
                loggedInUser?
                (<Link to="/dashboard" className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition duration-300">
                  Get Started
                </Link>)
                :
                (<Link to="/login" className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition duration-300">
                Get Started
              </Link>)
              }
              
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How BookHaven Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Books</h3>
              <p className="text-gray-600">
                Search our extensive catalog of new and used books from sellers worldwide.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Borrow Books</h3>
              <p className="text-gray-600">
                Subscribe to our borrowing service and enjoy books without committing to purchase.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sell Books</h3>
              <p className="text-gray-600">
                List your books for sale and reach thousands of potential buyers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-600">
                Get personalized recommendations and help from our AI book assistant.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Reading Journey?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of book lovers who buy, sell, and borrow books on BookHaven.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;