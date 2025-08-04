import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
      description: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
        default: "",
      },
      cloudinaryId: {
        type: String,
        default: "",
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      
    },
    
    { timestamps: true }
  );
  

export const Post = mongoose.model("Post", postSchema);
