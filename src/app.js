const express = require("express");
const app = express();
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

app.use(cookieParser());
app.use(express.json());
process.loadEnvFile(".env");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const authRouter = require("./routes/auth");
const requestRouter = require("./routes/request");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/users");
const chatRouter = require("./routes/chat");
const initalizeSocket = require("./utils/socket");

app.use("/", authRouter);
app.use("/", requestRouter);
app.use("/", profileRouter);
app.use("/", userRouter);
// app.use("/", chatRouter);
// data base connection

// configuration for socket server
const server = http.createServer(app);
initalizeSocket(server);

connectDb()
  .then(() => {
    // first connect to the database then only after connect to the server
    // highly important
    console.log("database connected sucessfully");
    //not a express app but add on with socket
    server.listen(process.env.PORT, () => {
      console.log("server is listening on", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
