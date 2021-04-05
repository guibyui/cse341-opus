const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const PDFDocument = require('pdfkit');

const Book = require('../models/book');

const ITEMS_PER_PAGE = 10;

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
      req.user.addToTote(book)
      book.removeStock();
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
  Book.findById(prodId)
    .then(book => {
      req.user.removeFromTote(prodId)
      book.addStock();
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
