import React, { useState } from 'react';
import axios from 'axios';

function AIBookRecommendationBot() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', content: "Hello! I'm your AI book recommendation assistant powered by Gemini. Tell me what you enjoy reading, your current mood, or a topic you're interested in, and I'll suggest some books for you." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // API key and URL
  const API_KEY = "AIzaSyA58ho_64s0kqAvoBztIexzcvZFsGR9x0A";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
  
  // Function to parse and format the book recommendations
  const formatBookRecommendations = (text) => {
    try {
      // Extract book sections using regex or simple parsing
      // This is a simplified approach - a more robust parser might be needed
      // depending on the exact format Gemini returns
      
      // First, check if this is an error message about inappropriate content
      if (text.includes("Please enter book-related information")) {
        return text;
      }
      
      // Format the books into a more visually appealing layout
      const formattedText = text
        // Replace markdown-style bullet points with HTML/JSX friendly format
        .replace(/\* \*\*Title:\*\* \*(.*?)\*/g, "<div class='book-item'><h3>$1</h3>")
        .replace(/\* \*\*Title:\*\* (.*?)(\n|\r)/g, "<div class='book-item'><h3>$1</h3>")
        .replace(/\*\*Author:\*\* (.*?)(\n|\r)/g, "<p class='author'><strong>By:</strong> $1</p>")
        .replace(/\*\*Description:\*\* (.*?)(\n\n|\r\n\r\n|$)/g, "<p class='description'>$1</p></div>");
      
      return formattedText;
    } catch (error) {
      console.error("Error formatting response:", error);
      return text; // Return the original text if formatting fails
    }
  };
  
  // Function to render HTML content safely in React
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  
  const fetchGeminiRecommendations = async (userQuery) => {
    setIsLoading(true);
    
    try {
      const prompt = `
      You are a book recommendation expert. Provide 3 personalized book recommendations based on the following user request.
      
      For each recommendation, format it EXACTLY as follows (including the asterisks and formatting):
      * **Title:** *Book Title*
      **Author:** Author Name
      **Description:** Brief description (2-3 sentences max).
      
      Make sure to add a blank line between each book recommendation.
      Make the recommendations diverse but relevant to the user's request.
      
      User request: "${userQuery}"
      
      If the user query is inappropriate or not related to books, respond with: "Please enter book-related information. I'm here to help you find great books to read!"
      `;
      
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        }
      );
      
      // Extract the text response from the API
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      const formattedResponse = formatBookRecommendations(aiResponse);
      
      // Update chat history
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: userQuery },
        { role: 'bot', content: formattedResponse, isHTML: true }
      ]);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      
      let errorMessage = "I'm sorry, I couldn't fetch recommendations at this time. Please try again later.";
      
      if (error.response) {
        console.error(error.response.data);
        console.error(error.response.status);
        errorMessage = `API Error (${error.response.status}): Please check your API configuration.`;
      } else if (error.request) {
        errorMessage = "Network Error: Unable to reach the Gemini API. Please check your internet connection.";
      }
      
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: userQuery },
        { role: 'bot', content: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() === '') return;
    
    fetchGeminiRecommendations(userInput);
  };
  
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-5">
      <div className="bg-gray-900 p-4 text-white">
        <h1 className="text-xl font-bold">AI Book Recommendation Assistant</h1>
        <p className="text-sm">Powered by Google Gemini</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.isHTML ? (
                <div 
                  dangerouslySetInnerHTML={createMarkup(message.content)} 
                  className="book-recommendations"
                />
              ) : (
                message.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .book-item {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        .book-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .book-item h3 {
          font-size: 18px;
          font-weight: bold;
          color: #2c5282;
          margin-bottom: 8px;
        }
        .author {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .description {
          font-size: 14px;
          line-height: 1.5;
        }
      `}</style>
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Tell me what kind of books you enjoy..."
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-teal-500 text-white px-4 py-2 rounded-r-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default AIBookRecommendationBot;