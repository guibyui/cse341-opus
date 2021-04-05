const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/books', shopController.getBooks);

router.get('/books/:bookId', shopController.getBook);

router.get('/tote', isAuth, shopController.getTote);

router.post('/tote', isAuth, shopController.postTote);

router.post('/tote-delete-item', isAuth, shopController.postToteDeleteBook);

module.exports = router;
