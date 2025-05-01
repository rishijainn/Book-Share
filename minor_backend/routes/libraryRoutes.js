const express = require('express');
 const libRouter = express.Router();
const Library = require('../Modal/Library'); // Changed variable name to avoid conflicts
// Get all libraries with pagination and search
libRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || '';

    const searchQuery = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const libraries = await Library.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Library.countDocuments(searchQuery);

    res.json({
      libraries,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLibraries: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new library
libRouter.post('/', async (req, res) => {
  try {
    const newLibrary = new Library(req.body);
    const savedLibrary = await newLibrary.save();
    res.status(201).json(savedLibrary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a library
libRouter.put('/:id', async (req, res) => {
  try {
    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    Object.assign(library, req.body);
    const updatedLibrary = await library.save();
    res.json(updatedLibrary);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete a library
libRouter.delete('/:id', async (req, res) => {
  try {
    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    await library.deleteOne(); // Updated to use deleteOne() instead of remove()
    res.json({ message: 'Library deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = libRouter;