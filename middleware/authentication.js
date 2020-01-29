const jwt = require("../utils/jwt");

module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      console.log("yes, is authenticated.");
      return next();
    }
    res.redirect("/");
  },

  isUser: (req, res, next) => {
    if (req.user && req.user.role === "public") return next();
    let error = new Error();
    error.message = "Please Login";
    error.status = 403;
    next(error);
  },

  isAdmin: (req, res, next) => {
    if (req.user && req.user.role === "admin") return next();
    let error = new Error();
    error.message = "You shall not pass.";
    error.status = 403;
    next(error);
  },

  isApiUser: (req, res, next) => {
    // console.log(req.url);
    // console.log(req.headers.token);
    console.log("enterded mid");

    const userId = jwt.verify(req.headers.token);
    if (userId) {
      req.user = { id: userId };
      console.log("exiting mid");

      return next();
    }
    let err = new Error();
    err.status = 500;
    err.message = "Invalid token supplied with request.";
    return res.json({ token: false, error: err.message });
  },

  isApiAdmin: (req, res, next) => {
    console.log(req.url);
    const user = jwt.verify(req.headers.token);
    if (user) {
      req.user = user;
      return next();
    }
    let err = new Error();
    err.status = 500;
    err.message = "Invalid token supplied with request.";
    return res.json({ token: false, error: err.message });
  }
};
