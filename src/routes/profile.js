const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../middleware/Auth");
const { validateProfileEditData } = require("../utils/validation");

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (error) {
    res.status(400).send("login again");
  }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("invalid edit request");
    }
    const loggedInuser = req.user;
    console.log(loggedInuser);
    Object.keys(req.body).forEach((key) => (loggedInuser[key] = req.body[key]));
    await loggedInuser.save();
    res.status(200).json({
      message: `${loggedInuser.firstName} profile updated sucesfully`,
      data: loggedInuser,
    });
  } catch (error) {
    res.send("ERROR :" + error.message);
  }
});

module.exports = profileRouter;
