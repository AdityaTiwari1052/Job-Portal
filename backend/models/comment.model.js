import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    textMessage: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // link to the User model
      required: true,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);