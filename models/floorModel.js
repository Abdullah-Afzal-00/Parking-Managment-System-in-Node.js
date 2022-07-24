const express = require("express");
const httpResponse = require("express-http-response");
const { default: mongoose } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const FloorSchema = new mongoose.Schema({
  floorNo: { type: Number, required: true, unique: true },
  capacity: Number,
  slots: [
    {
      isFree: { type: Boolean, default: true },
      slotNo: { type: Number, required: true },
    },
  ],
});
FloorSchema.plugin(uniqueValidator, { message: "is already exist." });

module.exports = mongoose.model("Floor", FloorSchema);
