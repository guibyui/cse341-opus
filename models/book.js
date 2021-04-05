const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genre: [
    {
      type: String,
      required: true
    }
  ],
  pageCount: {
    type: Number,
    required: false
  },
  backgroundColor: {
    type: String,
    required: true
  },
  inStock: {
    type: Number,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

bookSchema.methods.removeStock = function(num = 1) {
  this.inStock -= num;
  if (this.inStock < 0) {
    this.inStock = 0;
  }
  return this.save();
};

bookSchema.methods.addStock = function(num = 1) {
  this.inStock += num;
  return this.save();
};

module.exports = mongoose.model('Book', bookSchema);