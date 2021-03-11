module.exports = (req, res, next) => {
  if (req.session.isAdmin === false) {
    return res.redirect("/");
  }
  next();
};
