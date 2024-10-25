const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();
const validator = require("validator");
const User = require("../model/user");
const bcrypt = require("bcrypt");

// app.use() is exactly smiliar as app.authRouter

authRouter.post("/signup", async (req, res) => {
  try {
    // validation of data
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;

    // encryption of passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    //creating the new instance of the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    await user.save();
    res.status(200).send("user added sucessfully");
  } catch (error) {
    res.status(401).send(error.message);
  }
});

// login api
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("invalid EmailId");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("invalid credential ");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 1 * 3600000),
      });
      res.send("Login sucessfull!!!!!!!");
    } else {
      res.status(200).send("invalid password " + "🧑‍💻");
    }
  } catch (err) {
    res.status(404).send("login failed " + err.message);
  }
});
authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logged out sucessful");
});
module.exports = authRouter;
