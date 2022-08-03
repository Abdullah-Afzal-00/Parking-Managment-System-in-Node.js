const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const VehicleSchema = mongoose.Schema({
  category: { type: String, required: true },
  make: { type: Number, required: true },
  modelName: { type: String, required: true },
  color: { type: String, required: true },
  numberPlate: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
VehicleSchema.plugin(uniqueValidator, { message: "is already in the record." });

VehicleSchema.methods.toJSON = function () {
  return {
    category: this.category,
    model: this.make,
    color: this.color,
    numberPlate: this.numberPlate,
    modelName: this.modelName,
    id: this._id,
    owner: this.owner,
  };
};

module.exports = mongoose.model("Vehicle", VehicleSchema);
