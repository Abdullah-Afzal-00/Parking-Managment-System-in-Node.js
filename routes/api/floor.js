const router = require("express").Router();
const Vehicle = require("../../models/vehicleModel");
const Floor = require("../../models/floorModel");
const auth = require("../../middleware/auth");
const httpResponse = require("express-http-response");

//---------------Creating Floor ----------------------//
router.post("/create", auth.isToken, auth.isAdmin, async (req, res, next) => {
  var floor = new Floor();
  floor.floorNo = req.body.floorNo;
  floor.capacity = req.body.capacity;
  for (var i = 0; i < req.body.capacity; i++) {
    floor.slots.push({ slotNo: i });
  }
  floor
    .save()
    .then(() => {
      next(new httpResponse.OkResponse("success!"));
    })
    .catch((err) => {
      next(new httpResponse.BadRequestResponse(err));
    });
});

//-----------Updating Floor---------//
router.put("/update", auth.isToken, auth.isAdmin, (req, res) => {
  try {
    Floor.findOne({ floorNo: req.body.floorNo }, (err, data) => {
      if (!err && data) {
        data.slots[req.body.slotNo].isFree = req.body.isFree;
        data.save();
        res.send("data Updated Successfully");
      } else {
        res.send("Not Found!");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

//----------------Displaying Floors -----------------------//
router.get("/showAll", auth.isToken, auth.isUser, (req, res) => {
  Floor.find()
    .populate()
    .exec((err, result) => {
      if (err) {
        res.status(401).send(err);
      } else if (result) {
        res.status(200).send(result);
      }
    });
});

//--------------Deleting Floor----------------------//
router.delete("/delete/:id", auth.isToken, auth.isAdmin, async (req, res) => {
  try {
    const floor = await Floor.findOne({ floorNo: req.params.id });
    if (floor) {
      floor.remove();
      res.send("Floor deleted successfully!");
    } else {
      res.status(404).send("Floor not found!");
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
