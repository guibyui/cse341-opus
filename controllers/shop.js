const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const PDFDocument = require('pdfkit');

const Book = require('../models/book');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getBooks = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Book.find()
    .countDocuments()
    .then(numBooks => {
      totalItems = numBooks;
      return Book.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(books => {
      res.render('shop/book-list', {
        prods: books,
        pageTitle: 'Books',
        path: '/books',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getBook = (req, res, next) => {
  const prodId = req.params.bookId;
  Book.findById(prodId)
    .then(book => {
      res.render('shop/book-detail', {
        book: book,
        pageTitle: book.title,
        path: '/books'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Book.find({
    '_id': { $in: [
        mongoose.Types.ObjectId('60620a97aa80c6a654b9bdd3'),
        mongoose.Types.ObjectId('60653b133a4705487c55addc'), 
        mongoose.Types.ObjectId('606539703a4705487c55addb')
    ]}
  })
    .then(books => {
      res.render('shop/index', {
        prods: books,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getTote = (req, res, next) => {
  req.user
    .populate('tote.items.bookId')
    .execPopulate()
    .then(user => {
      const books = user.tote.items;
      res.render('shop/tote', {
        path: '/tote',
        pageTitle: 'Your Tote',
        books: books
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postTote = (req, res, next) => {
  const prodId = req.body.bookId;
  Book.findById(prodId)
    .then(book => {
      return req.user.addToTote(book);
    })
    .then(result => {
      console.log(result);
      res.redirect('/tote');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postToteDeleteBook = (req, res, next) => {
  const prodId = req.body.bookId;
  req.user
    .removeFromTote(prodId)
    .then(result => {
      res.redirect('/tote');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('tote.items.bookId')
    .execPopulate()
    .then(user => {
      const books = user.tote.items.map(i => {
        return { quantity: i.quantity, book: { ...i.bookId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        books: books
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearTote();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.books.forEach(prod => {
        totalPrice += prod.quantity * prod.book.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.book.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.book.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};
