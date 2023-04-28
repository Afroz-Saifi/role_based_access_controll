const express = require("express");
const { connection } = require("./config/db");
const { router } = require("./routes/router.route");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/", router);

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("connected to DB successfully");
  } catch (err) {
    console.log("error connecting to DB");
    console.log(err);
  }
  console.log(`listening on port ${process.env.port}`);
});
