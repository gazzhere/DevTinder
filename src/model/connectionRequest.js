const mongoose = require("mongoose");
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status  type`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// compound indexing
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
// this pre act like a middleware dont forget to add next()
// this happens before saving
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // check if fro or to user id is ame as touserid
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("cannot send request to yourself");
  }
  next();
});
module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
