const express = require("express");
const userAuth = require("../middleware/Auth");
const connectionRequest = require("../model/connectionRequest");
const userRouter = express.Router();
const SAFE_DATA = "firstName lastName age photoUrl skills about";
const User = require("../model/user");
userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionrequest = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", SAFE_DATA);
    res
      .status(200)
      .json({ message: "fecthed sucessfully", data: connectionrequest });
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});
userRouter.get("/user/requests/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectoinRequest = await connectionRequest
      .find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", SAFE_DATA)
      .populate("toUserId", SAFE_DATA);

    const data = connectoinRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.status(200).json({ message: "fecthed sucessfully", data: data });
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});
// feed api implementation
userRouter.get("/feeds", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    limit = limit > 50 ? 50 : limit;

    const connectionrequest = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");
    const hiddenuser = new Set();
    connectionrequest.forEach((req) => {
      hiddenuser.add(req.fromUserId.toString());
      hiddenuser.add(req.toUserId.toString());
    });
    const user = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenuser) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(SAFE_DATA)
      .skip(skip)
      .limit(limit);
    res.status(200).json({ data: user });
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});
module.exports = userRouter;
