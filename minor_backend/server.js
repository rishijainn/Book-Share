const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const {sendEmail} = require("./emailService");
const libRouter=require("./routes/libraryRoutes");
const { type } = require("os");
const app = express();
const PORT = process.env.PORT || 7654;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/libraries',libRouter)

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPG files are allowed."));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/bookexchange", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  dob: { type: Date, required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  yearOfPublish: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  location: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  seller: { type: String, required: true },
  imageUrl: { type: String, required: true },
  catagory:{type:String}
});

const exchangeBookSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true },
  exchanger: { type: String, required: true },
  location: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  imageUrl: { type: String }

});

// Models
const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);
const ExchangeBook = mongoose.model('ExchangeBook', exchangeBookSchema);

// Authentication Routes
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password, dob, mobileNumber } = req.body;

    if (!username || !email || !password || !dob || !mobileNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const newUser = new User({
      username,
      email,
      password, // Note: In production, password should be hashed
      dob: new Date(dob),
      mobileNumber
    });
    
    await newUser.save();
    res.json({ message: "Signup successful! You can now log in." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Username/email and password are required." });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user || user.password !== password) { // Note: In production, use proper password comparison
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { password: _, ...userData } = user.toObject();
    res.json({ message: "Login successful!", user: userData });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Password Reset Routes
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { identifier, dob } = req.body;

    if (!identifier || !dob) {
      return res.status(400).json({ message: "Username/email and date of birth are required." });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user || new Date(user.dob).getTime() !== new Date(dob).getTime()) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    res.json({ message: "Verification successful! You can reset your password." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ message: "Username/email and new password are required." });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword; // Note: In production, password should be hashed
    await user.save();
    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Book Routes
app.post("/api/sell-book", upload.single("image"), async (req, res) => {
  try {
    const { bookName, yearOfPublish, originalPrice, sellPrice, location, seller,catagory } = req.body;

    if (!bookName || !yearOfPublish || !originalPrice || !sellPrice || !location || !seller) {
      return res.status(400).json({ message: "All fields are required." });
    }


    const imageUrl = req.file ? req.file.path : null;
    if (!imageUrl) {
      return res.status(400).json({ message: "Book image is required." });
    }

    const newBook = new Book({
      bookName,
      yearOfPublish,
      originalPrice,
      sellPrice,
      location,
      seller,
      imageUrl,
      catagory
    });

    await newBook.save();

    const user = await User.findOne({ username: seller });
    if (user) {
      user.books.push(newBook._id);
      await user.save();
    }

    res.json({ message: "Book posted successfully!" });
  } catch (error) {
    console.error("Error posting book:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.get("/api/books-for-sale", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Failed to fetch books." });
  }
});

app.get("/api/user-books/:username", async (req, res) => {
  try {
    const books = await Book.find({ seller: req.params.username });
    res.json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);
    res.status(500).json({ message: "Failed to fetch books." });
  }
});

app.get("/api/purchase-books/:username", async (req, res) => {
  try {
    const books = await Book.find({ seller: { $ne: req.params.username } });
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Failed to fetch books." });
  }
});

// Book Purchase Route
app.post("/api/buy-book", async (req, res) => {
  try {
    const { user, bookId } = req.body;

    if (!user || !bookId) {
      return res.status(400).json({ message: "User and Book ID are required." });
    }

    const [book, buyer] = await Promise.all([
      Book.findById(bookId),
      User.findOne({ username: user })
    ]);

    if (!book || !buyer) {
      return res.status(404).json({ message: "Book or user not found." });
    }

    const seller = await User.findOne({ username: book.seller });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    buyer.purchasedBooks = buyer.purchasedBooks || [];
    buyer.purchasedBooks.push(bookId);
    await buyer.save();

    // Send email notifications
    const sellerEmail = {
      to: seller.email,
      subject: "Book Sale Notification",
      text: `
        Hello ${seller.username}!
        You have sold: ${book.bookName}
        Buyer: ${buyer.username}
        Contact: ${buyer.mobileNumber}
      `
    };

    const buyerEmail = {
      to: buyer.email,
      subject: "Purchase Confirmation",
      text: `
        Hello ${buyer.username}!
        You purchased: ${book.bookName}
        Seller: ${seller.username}
        Contact: ${seller.mobileNumber}
      `
    };

    await Promise.all([
      sendEmail(sellerEmail.to, sellerEmail.subject, sellerEmail.text),
      sendEmail(buyerEmail.to, buyerEmail.subject, buyerEmail.text)
    ]);

    res.json({ message: "Book purchase successful! Notifications sent." });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: "Failed to process purchase." });
  }
});

// Exchange Book Routes
app.post('/api/exchange-book', upload.single("image"), async (req, res) => {
  try {
    const { bookTitle, exchanger, location } = req.body;

    if (!bookTitle || !exchanger || !location) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const imageUrl = req.file ? req.file.path : null;
    if (!imageUrl) {
      return res.status(400).json({ message: "Book image is required." });
    }

    const newExchangeBook = new ExchangeBook({ 
      bookTitle, 
      exchanger, 
      location, 
      imageUrl 
    });
    await newExchangeBook.save();
    
    res.status(201).json({ 
      message: "Exchange request created successfully.", 
      book: newExchangeBook 
    });
  } catch (error) {
    console.error("Error creating exchange request:", error);
    res.status(500).json({ message: "Failed to create exchange request." });
  }
});

// Add this route to your server.js file

// Exchange Book Request Route
app.post('/api/exchange-book-request', async (req, res) => {
  try {
    const { bookId, exchanger, receiver, location } = req.body;
    
    // Find the book being exchanged
    const book = await ExchangeBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Find both users to get their email addresses
    const [exchangerUser, receiverUser] = await Promise.all([
      User.findOne({ username: exchanger }),
      User.findOne({ username: receiver })
    ]);
    
    if (!exchangerUser || !receiverUser) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    // Update the exchange book to mark it as requested
    book.requestedBy = exchanger;
    book.requestStatus = 'pending';
    await book.save();
    
    // Send email to the book owner (receiver)
    const receiverEmailContent = `
      Hello ${receiver},
      
      A user wants to exchange books with you!
      
      Book: ${book.bookTitle}
      Requested by: ${exchanger}
      Contact Email: ${exchangerUser.email}
      Contact Phone: ${exchangerUser.mobileNumber}
      Location: ${location}
      
      Please contact them directly to arrange the exchange.
      
      Regards,
      BookExchange Team
    `;
    
    // Send email to the person requesting the exchange
    const exchangerEmailContent = `
      Hello ${exchanger},
      
      Your book exchange request has been sent!
      
      Book: ${book.bookTitle}
      Owner: ${receiver}
      Contact Email: ${receiverUser.email}
      Contact Phone: ${receiverUser.mobileNumber}
      Location: ${location}
      
      The book owner has been notified. They will contact you soon to arrange the exchange.
      
      Regards,
      BookExchange Team
    `;
    
    // Send both emails
    await Promise.all([
      sendEmail(receiverUser.email, 'New Book Exchange Request', receiverEmailContent),
      sendEmail(exchangerUser.email, 'Book Exchange Request Confirmation', exchangerEmailContent)
    ]);
    
    res.status(200).json({ 
      message: 'Exchange request sent successfully! Both parties have been notified via email.'
    });
    
  } catch (error) {
    console.error('Error processing exchange request:', error);
    res.status(500).json({ message: 'Failed to process exchange request.' });
  }
});

app.get('/api/user-exchange-books/:username', async (req, res) => {
  try {
    const username = req.params.username;
    console.log(username)
    
    // Find exchange books where this user is the exchanger
    const exchangeBooks = await ExchangeBook.find({
      exchanger: username
    });
    
    if (!exchangeBooks.length) {
      return res.json([]); // Return empty array instead of 404 for no books
    }
    
    res.json(exchangeBooks);
  } catch (error) {
    console.error("Error fetching exchange books:", error);
    res.status(500).json({ message: "Failed to fetch exchange books." });
  }
});

// Delete an exchange book
app.delete('/api/exchange-books/:bookId', async (req, res) => {
  try {
    const bookId = req.params.bookId;
    
    // Find and delete the book
    const deletedBook = await ExchangeBook.findByIdAndDelete(bookId);
    
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found or already deleted." });
    }
    
    res.json({ message: "Book deleted successfully", deletedBook });
  } catch (error) {
    console.error("Error deleting exchange book:", error);
    res.status(500).json({ message: "Failed to delete exchange book." });
  }
});

// Get books requested by a specific user
app.get('/api/requested-books/:username', async (req, res) => {
  try {
    const username = req.params.username;
    
    // Find books where this user is the requester
    const requestedBooks = await ExchangeBookRequest.find({ 
      requester: username 
    }).populate('bookId'); // Assuming you want the full book details
    
    if (!requestedBooks.length) {
      return res.status(404).json({ message: "No books have been requested by this user." });
    }
    
    res.json(requestedBooks);
  } catch (error) {
    console.error("Error fetching requested books:", error);
    res.status(500).json({ message: "Failed to fetch requested books." });
  }
});

// Delete Book Route
app.delete("/api/delete-book/:bookId", async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const seller = await User.findOne({ username: book.seller });
    if (seller) {
      seller.books = seller.books.filter(id => id.toString() !== req.params.bookId);
      await seller.save();
    }

    await Book.findByIdAndDelete(req.params.bookId);
    res.json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Failed to delete book." });
  }
});

// Update User Route
app.put('/api/user/:username', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { email: req.body.email, mobileNumber: req.body.mobileNumber },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user." });
  }
});

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something broke!" });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: "Endpoint not found." });
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});