const express = require("express");
const requestRouter = express.Router();
const userAuth = require("../middleware/Auth");
const connectionRequest = require("../model/connectionRequest");
const User = require("../model/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,

  async (req, res) => {
    try {
      const fromUserId = req.user;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatus = ["interested", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "invalid status type " + status });
      }
      const touser = await User.findById(toUserId);
      if (!touser) {
        return res.status(400).send({ message: "user not found" });
      }
      // if existing connection request
      const existingConnectionRequest = await connectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).json({ message: "connection already exist" });
      }
      const connectionrequest = new connectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionrequest.save();
      res
        .status(200)
        .json({ message: "connection request sent succesfully", data: data });
    } catch (error) {
      res.status(400).send("ERROR :" + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;
      // first we will validat  e status
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "invalid status type" });
      }
      const connectionrequest = await connectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionrequest) {
        return res
          .status(400)
          .json({ message: "connection request not found" });
      }
      connectionrequest.status = status;

      // logged in user should to user id
      // status shouldbe intersted
      // user id should be valid
      const data = await connectionrequest.save();
      res.status(400).json({ message: "connection request", data });
    } catch (error) {
      res.status(400).send("ERROR :" + error.message);
    }
  }
);




module.exports = requestRouter;
