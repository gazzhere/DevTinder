const jwt = require("jsonwebtoken");
const User = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    // read the token from the req cookie
    const { token } = req.cookies;
    if (!token) {
      throw new Error("token is not valid!!!!!!!!!!!");
    }

    // validate the token
    const decodedobject = await jwt.verify(token, process.env.JWTSECRET);
    const { _id } = decodedobject;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(404).send("bad request " + error.message);
  }
};
module.exports = userAuth;
