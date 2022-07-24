const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/userModel");

const tokenKey = process.env.TOKEN_KEY;

const isToken = (req, res, next) => {
  var token = req.headers.authorization.split(" ");
  if (typeof token[1] === "undefined" || typeof token[1] === null) {
    res
      .status(401)
      .send({ message: "Please login first to continue further!" });
  } else {
    jsonwebtoken.verify(token[1], tokenKey, (err, data) => {
      if (err) {
        res
          .status(401)
          .send({ message: "Please login first to continue further!" });
      } else {
        req.user = data;
        next();
      }
    });
  }
};

const isUser = function (req, res, next) {
  User.findOne({ email: req.user.email }, (err, user) => {
    if (err || !user) {
      res.status(401).send({ message: "You are not registerd" });
    } else {
      req.user = user;
      next();
    }
  });
};

const isAdmin = function (req, res, next) {
  User.findOne({ email: req.user.email }, (err, user) => {
    if (err || !user) {
      res.status(401).send({ message: "You ar not admin" });
    } else {
      if (user.role === 1) next();
      else res.status(401).send({ message: "You are not admin" });
    }
  });
};

const isStaff = function (req, res, next) {
  if (req.user.role === 2) {
    next();
  } else res.status(401).send({ message: "You are not admin" });
};

module.exports = { isAdmin, isUser, isStaff, isToken };
