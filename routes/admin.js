const path = require("path");

const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const isAdmin = require("../middleware/is-admin");

const router = express.Router();

// /admin/add-book => GET
router.get("/add-book", isAdmin, isAuth, adminController.getAddBook);

// /admin/books => GET
router.get("/books", isAuth, adminController.getBooks);

// /admin/add-book => POST
router.post(
  "/add-book",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  isAdmin,
  adminController.postAddBook
);

router.get("/edit-book/:bookId", isAdmin, isAuth, adminController.getEditBook);

router.post(
  "/edit-book",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  isAdmin,
  adminController.postEditBook
);

router.post("/delete-book", isAdmin, isAuth, adminController.postDeleteBook);

module.exports = router;
