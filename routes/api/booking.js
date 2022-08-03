const router = require("express").Router();
const User = require("../../models/userModel");
const Vehicle = require("../../models/vehicleModel");
const Floor = require("../../models/floorModel");
const auth = require("../../middleware/auth");
const Booking = require("../../models/bookingModel");

const {
  OkResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} = require("express-http-response");

router.post("/register", auth.isToken, auth.isUser, (req, res, next) => {
  try {
    const booking = new Booking();
    Vehicle.findOne({ numberPlate: req.body.numberPlate }, (err, vehicle) => {
      if (!err && vehicle === null) {
        return next(new BadRequestResponse("Vehicle is not in database"));
        //res.send("vehicle must be registered first!");
      } else {
        Booking.findOne({ vehicles: vehicle._id }, (err, data) => {
          //vehicle._id
          if (!err && data) {
            return next(
              new BadRequestResponse("Vehicle is already registered")
            );
            //res.send("Vehicle is Already Booked").status('422');
          } else {
            Floor.findOne({ floorNo: req.body.floorNo }, (err, result) => {
              if (!err && result) {
                if (result.slots[req.body.slotNo].isFree === false) {
                  return next(new BadRequestResponse("Spot is already booked"));
                  //res.send("Spot is already Booked!");
                } else {
                  result.slots[req.body.slotNo].isFree = false;
                  result.save();
                  booking.floors = req.body.floorNo;
                  booking.slotNo = req.body.slotNo;
                  booking.vehicles = vehicle._id;
                  booking.user = req.user._id;
                  booking.startTime = new Date(Date.now());
                  booking.endTime = new Date(req.body.endTime);
                  booking.save().then((result) => {
                    if (result) {
                      //next(new OkResponse({message:"Booking created successfully"}));
                      return res.status(200).send(result);
                    } else {
                      return next(
                        new BadRequestResponse("Error while booking")
                      );
                      //res.send("Error while booking!\n");
                    }
                  });
                }
              } else {
                return next(new BadRequestResponse("Floor not found"));
                //res.status(404).send("Floor Not Found!");
              }
            });
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
});
router.post(
  "/calculateFare",
  auth.isToken,
  auth.isUser,
  async (req, res, next) => {
    const t = req.body.time;
    const date1 = Date.now();
    const time = new Date(t).getTime();
    const date2 = time;
    console.log("date 1 ", date1);
    console.log("date 2", date2);
    const temp = new Booking();
    const fare = temp.calculateRent(date2, date1);
    console.log(fare);
    delete temp;
    res.status(200).send({ fare });
  }
);

router.post("/calculate", auth.isToken, (req, res, next) => {
  try {
    Vehicle.findOne({ numberPlate: req.body.numberPlate }, (err, data) => {
      if (err || data === null) {
        //next(new BadRequestResponse({ message: "Vehicle not found" }));
        res.status(401).send("vehicle not found!");
      } else if (!err && data) {
        console.log(data._id);
        Booking.findOne({ vehicles: data._id }, (err, result) => {
          if (err || result === null) {
            //next(new BadRequestResponse({ message: "No such booking exist!" }));
            res.status(401).send("No such booking exist!");
          } else if (!err && result) {
            console.log(result);
            const amount = result.calculateRent(Date.now(), result.startTime);
            res.status(200).json("Total Amount in PKR " + amount);
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/delete/:id", auth.isToken, async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({
      numberPlate: req.params.id,
    });
    if (!vehicle) res.status(401).send("No vehicle found in Bookings");
    Booking.findOne(
      { user: req.user.user_id.toString(), vehicles: vehicle._id.toString() },
      (err, data) => {
        if (!err && data) {
          Floor.findOne({ floorNo: data.floors }, (err, result) => {
            //console.log(result.slots[data.slotNo]);
            if (!err && result) {
              result.slots[data.slotNo].isFree = true;
              result.save();
            } else next(new BadRequestResponse("Fail to free slot"));
            //console.log(result.slots[data.slotNo]);
          });
          data.remove();
          res.status(200).send("deleted");
        } else {
          next(new BadRequestResponse("You can delete only your Booking"));
        }
      }
    );
  } catch (err) {
    next(new BadRequestResponse("Something went wrong"));
  }
});

//----------------------Delete By Admin----------------------//
router.delete(
  "/deleteAny/:id",
  auth.isToken,
  auth.isAdmin,
  async (req, res, next) => {
    try {
      const vehicle = await Vehicle.findOne({
        numberPlate: req.params.id,
      });
      if (!vehicle) res.status(401).send("No vehicle found in Bookings");
      Booking.findOne({ vehicles: vehicle._id.toString() }, (err, data) => {
        if (!err && data) {
          Floor.findOne({ floorNo: data.floors }, (err, result) => {
            //console.log(result.slots[data.slotNo]);
            if (!err && result) {
              result.slots[data.slotNo].isFree = true;
              result.save();
            } else next(new BadRequestResponse("Fail to free slot"));
            //console.log(result.slots[data.slotNo]);
          });
          data.remove();
          res.status(200).send("deleted");
        } else {
          next(new BadRequestResponse("Fail to Delete"));
        }
      });
    } catch (err) {
      next(new BadRequestResponse("Something went wrong"));
    }
  }
);

router.get("/show", (req, res, next) => {
  try {
    Booking.find()
      .populate("vehicles")
      .populate("user")
      .exec((err, data) => {
        if (!err && data) {
          res.send(data);
        } else {
          next(
            new BadRequestResponse({ message: "No booking exist right now!" })
          );
          res.send("No Booking found!");
        }
      });
  } catch (err) {}
});

module.exports = router;
