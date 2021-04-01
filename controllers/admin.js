const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator');

const Book = require('../models/book');

exports.getAddBook = (req, res, next) => {
  res.render('admin/edit-book', {
    pageTitle: 'Add Book',
    path: '/admin/add-book',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddBook = (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const description = req.body.description;
  const genre = req.body.genre;
  const pageCount = req.body.pageCount;
  const backgroundColor = req.body.backgroundColor;
  const inStock = req.body.inStock;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-book', {
      pageTitle: 'Add Book',
      path: '/admin/add-book',
      editing: false,
      hasError: true,
      book: {
        title,
        author,
        description,
        genre,
        pageCount,
        backgroundColor,
        inStock
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const book = new Book({
    title,
    author,
    description,
    genre,
    pageCount,
    backgroundColor,
    inStock,
    userId: req.user
  });
  book
    .save()
    .then(result => {
      console.log('Created Book');
      res.redirect('/admin/books');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditBook = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.bookId;
  Book.findById(prodId)
    .then(book => {
      if (!book) {
        return res.redirect('/');
      }
      res.render('admin/edit-book', {
        pageTitle: 'Edit Book',
        path: '/admin/edit-book',
        editing: editMode,
        book: book,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditBook = (req, res, next) => {
  const prodId = req.body.bookId;
  const updatedTitle = req.body.title;
  const updatedAuthor = req.body.author;
  const updatedDescription = req.body.description;
  const updatedGenre = req.body.genre;
  const updatedpageCount = req.body.pageCount;
  const updatedBackgroundColor = req.body.backgroundColor;
  const updatedInStock = req.body.inStock;
  

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-book', {
      pageTitle: 'Edit Book',
      path: '/admin/edit-book',
      editing: true,
      hasError: true,
      book: {
        title: updatedTitle,
        author: updatedAuthor,
        description: updatedDescription,
        genre: updatedGenre,
        pageCount: updatedpageCount,
        backgroundColor: updatedBackgroundColor,
        inStock: updatedInStock,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  console.log(prodId)

  Book.findById(prodId)
    .then(book => {
      book.title = updatedTitle;
      book.author = updatedAuthor;
      book.description = updatedDescription;
      book.genre = updatedGenre;
      book.pageCount = updatedpageCount;
      book.backgroundColor = updatedBackgroundColor;
      book.inStock = updatedInStock;
      return book.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/books');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      // console.log(books);
      res.render('admin/books', {
        prods: books,
        pageTitle: 'Admin Books',
        path: '/admin/books'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteBook = (req, res, next) => {
  const prodId = req.body.bookId;
  Book.findById(prodId)
    .then(book => {
      if (!book) {
        return next(new Error('Book not found.'));
      }
      return Book.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/books');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
