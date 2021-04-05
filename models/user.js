const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  tote: {
    items: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  level: {
    type: Boolean,
    ofBoolean: [true, false],
    default: false,
  },
});

userSchema.methods.addToTote = function(book) {
  if(book.inStock == 0){
    return this.save();
  }
  const toteBookIndex = this.tote.items.findIndex(cp => {
    return cp.bookId.toString() === book._id.toString();
  });
  let newQuantity = 1;
  const updatedToteItems = [...this.tote.items];

  if (toteBookIndex >= 0) {
    newQuantity = this.tote.items[toteBookIndex].quantity + 1;
    updatedToteItems[toteBookIndex].quantity = newQuantity;
  } else {
    updatedToteItems.push({
      bookId: book._id,
      quantity: newQuantity
    });
  }
  const updatedTote = {
    items: updatedToteItems
  };
  this.tote = updatedTote;
  return this.save();
};

userSchema.methods.removeFromTote = function(bookId) {
  const updatedToteItems = this.tote.items.filter(item => {
    return item.bookId.toString() !== bookId.toString();
  });
  this.tote.items = updatedToteItems;
  return this.save();
};

userSchema.methods.clearTote = function() {
  this.tote = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
