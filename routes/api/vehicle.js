const router = require("express").Router();
const User = require("../../models/userModel");
const Vehicle = require("../../models/vehicleModel");
const auth = require("../../middleware/auth");
const vehicleModel = require("../../models/vehicleModel");

//----Adding Vehicle---------//
router.post("/add", auth.isToken, auth.isUser, function (req, res) {
  try {
    console.log(req.body);
    User.findOne({ email: req.user.email }, (err, data) => {
      if (err) return res.send("Oops! You have to register yourself");
      else if (data) {
        var hv = new Vehicle();
        hv.category = req.body.category;
        hv.make = req.body.model;
        hv.color = req.body.color;
        hv.numberPlate = req.body.numberPlate;
        hv.owner = data._id;
        hv.save((err) => {
          if (err) {
            res.status(401).send(err);
          } else {
            res.status(200).send(hv);
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
});
router.get("/showAll", auth.isToken, auth.isAdmin, (req, res) => {
  try {
    Vehicle.find()
      .populate()
      .exec(function (err, result) {
        if (err) res.status(401).send(err);
        else res.status(200).send(result);
      });
  } catch (err) {
    console.error(err);
  }
});

//----------Update Vehicle  By User--------------//

router.put("/update", auth.isToken, auth.isUser, (req, res) => {
  try {
    Vehicle.findOne({ numberPlate: req.body.numberPlate }, (err, vec) => {
      if (err) {
        res.send("Vechile with  provided details was not found");
      } else {
        if (typeof req.body.color !== "undefined") {
          vec.color = req.body.color;
        }
        if (typeof req.body.category !== "undefined") {
          vec.category = req.body.category;
        }
        if (typeof req.body.model !== "undefined") {
          vec.model = req.body.model;
        }
        vec.save((err) => {
          if (err) {
            res.status(401).send(err);
          } else {
            res.status(200).send(vec.toJSON());
          }
        });
      }
    });
  } catch (err) {}
});

//--------------show User Vehihcle ----------------//
router.get("/showUserVehicles", auth.isToken, auth.isUser, async (req, res) => {
  try {
    const userVehicleList = await Vehicle.find({ owner: req.user._id });
    if (userVehicleList) res.status(200).send(userVehicleList);
    else res.status(404).send("No vehicle is registerd under your ownership");
  } catch (err) {
    console.log(err);
  }
});

//---------Delete User Vehicle by User------------//
router.delete(
  "/deleteUserVehicle",
  auth.isToken,
  auth.isUser,
  async (req, res) => {
    try {
      const userVehicle = await Vehicle.findOne({
        numberPlate: req.body.numberPlate,
      });
      if (
        userVehicle &&
        userVehicle.owner.toString() === req.user._id.toString()
      ) {
        userVehicle.remove();
        res.send("Vehicle deleted successfully!");
      } else res.status(404).send("Kindly give Correct NumberPlate");
    } catch (err) {
      console.log(err);
    }
  }
);

//------------Delete Vehicle by Admin-----------------//

router.delete("/delete", auth.isToken, auth.isAdmin, (req, res) => {
  try {
    Vehicle.deleteOne({ numberPlate: req.body.numberPlate }, (err, data) => {
      if (err) {
        res.status(500).send("Vehicle with provided numberPlate not found!");
      } else {
        res.status(200).send(data);
      }
    });
  } catch (err) {
    res.send("Couldn't delete data");
  }
});
module.exports = router;
