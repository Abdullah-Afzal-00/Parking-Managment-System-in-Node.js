const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");

require("dotenv").config();
const saltRounds = parseInt(process.env.SALT_ROUNDS);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: null, required: true },
    username: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
    },
    role: {
      type: Number,
      default: 3, // default 2- User
      enum: [
        1, // 1: Admin
        2, // 2: Staff
        3, // 3: User
      ],
    },
    hash: { type: String },
    salt: { type: String },
  },
  { timestamp: true }
);
UserSchema.plugin(uniqueValidator, { message: "is already taken." });
UserSchema.plugin(mongoosePaginate);

UserSchema.methods.validPassword = function (password) {
  let hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};
UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    { user_id: this._id, email: this.email },
    process.env.TOKEN_KEY,
    {
      expiresIn: "72h",
    }
  );
};
UserSchema.methods.toJSON = function () {
  return {
    email: this.email,
    username: this.username,
  };
};

UserSchema.methods.toAuthJSON = function () {
  return {
    token: this.generateJWT(),
    email: this.email,
    username: this.username,
    role: this.role,
  };
};
module.exports = mongoose.model("User", UserSchema);
