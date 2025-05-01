const mongoose = require('mongoose');

const Library = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  author: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Classic', 'Science']
  },
  condition: { 
    type: String, 
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor']
  },
  status: { 
    type: String, 
    required: true,
    default: 'Available',
    enum: ['Available', 'Borrowed']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('library', Library);