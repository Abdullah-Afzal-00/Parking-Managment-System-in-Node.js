const express = require("express");
const httpResponse = require("express-http-response");
const authRoute = require("./routes");
const cors = require("cors");
require("./config");
//const user = require("./models/userModel");

require("dotenv").config();
const port = process.env.PORT;

const app = express();

app.use(express.json());

// app.post("/signup", async (req, res, next) => {
//   console.log(req.body);
//   const pass = req.body.password;
//   delete req.body.password;
//   let data = new user(req.body);
//   await data.setPassword(pass);
//   data
//     .save()
//     .then(() => {
//       next(new httpResponse.OkResponse("success!"));
//     })
//     .catch((err) => {
//       next(new httpResponse.BadRequestResponse(err));
//     });
// });

//console.log("In the App!");

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
require("./models/userModel");
require("./models/floorModel");

app.use(authRoute);

app.use(httpResponse.Middleware);

app.listen(port, () => {
  console.log(`App is listening on ${port} port`);
});
