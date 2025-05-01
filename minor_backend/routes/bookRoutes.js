const express = require("express");
const { getBooks, addBook } = require("../controllers/bookController");
const router = express.Router();

router.get("/", getBooks);
router.post("/add", addBook);

module.exports = router;

// controllers/bookController.js
const Book = require("../models/Book");

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Error fetching books" });
  }
};

exports.addBook = async (req, res) => {
  try {
    const { title, author, description } = req.body;
    const newBook = new Book({ title, author, description });
    await newBook.save();
    res.status(201).json({ message: "Book added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding book" });
  }
};