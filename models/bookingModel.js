const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const BookingSchema = mongoose.Schema({
  slotNo: { type: String, required: true },
  floors: { type: String, required: true },
  vehicles: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startTime: { type: String, default: Date.now() },
  endTime: { type: String, required: true },
});

BookingSchema.pre("find", function () {
  this.populate("vehicles");
  this.populate("user");
});

BookingSchema.methods.calculateRent = function (date1, date2) {
  console.log(date1);
  const _date1 = new Date(date1);
  const _date2 = new Date(date2);
  var difference_in_time = _date1 - _date2;
  console.log(difference_in_time);
  var difference_in_days = difference_in_time / (1000 * 3600 * 24);
  var amount = difference_in_days * 80;
  console.log("Total Amount in PKR " + amount);
  return amount;
};

BookingSchema.plugin(uniqueValidator, { message: "is already filled." });

module.exports = mongoose.model("Booking", BookingSchema);
