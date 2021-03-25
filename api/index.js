//REQUIRES
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const colors = require("colors");

//INSTANCES
const app = express();

//express config
app.use(morgan("tiny"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cors());

//EXPRESS ROUTES
app.use("/api", require("./routes/devices.js"));
app.use('/api', require("./routes/users.js"))
app.use('/api', require("./routes/templates.js"))
app.use('/api', require("./routes/webhooks.js"))
app.use('/api', require("./routes/emqxapi.js"))

//ENDPOINT TESTS
app.get("/", (req, res) => {
  return res.send("Hello world");
});

//LISTENER PORT
app.listen(3001, () => {
  console.log("API server listening on port 3001");
});

const mongoUserName = "devuser";
const mongoPassword = "devpassword";
const mongoHost = "localhost";
const mongoPort = 27017;
const mongoDatabase = "ioticos_god_level";

var uri =
  "mongodb://" +
  mongoUserName +
  ":" +
  mongoPassword +
  "@" +
  mongoHost +
  ":" +
  mongoPort +
  "/" +
  mongoDatabase;

var options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  authSource: "admin"
};

try {
    
    mongoose.connect(uri, options).then(
      () => {
        console.log("\n");
        console.log("*******************************".green);
        console.log("✔ Mongo Successfully Connected!".green);
        console.log("*******************************".green);
        console.log("\n");
      },
      err => {
        console.log("\n");
        console.log("*******************************".red);
        console.log("    Mongo Connection Failed    ".red);
        console.log("*******************************".red);
        console.log("\n");
        console.log(err);
      }
    );
} catch (error) {
    console.log("ERROR CONNECTION MONGODB");
    console.log(error.red);
}
module.exports = app;
