const express = require("express");
const httpResponse = require("express-http-response");
const authRoute = require("./routes");
const cors = require("cors");
require("./config");

require("dotenv").config();
const port = process.env.PORT;

const app = express();

app.use(express.json());

app.use(cors());
require("./models/userModel");
require("./models/floorModel");

app.use(authRoute);

app.use(httpResponse.Middleware);

app.listen(port, () => {
  console.log(`App is listening on ${port} port`);
});
