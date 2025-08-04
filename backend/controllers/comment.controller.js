import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";

export const addComment = async (req, res) => {
  try {
    const { textMessage } = req.body;
    const userId = req.user?._id;
    const postId = req.params.postId;

    // 1. Create the comment
    const comment = await Comment.create({
      textMessage,
      user: userId,
    });

    // 2. Push comment into the post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    // 3. Fetch updated post with populated comments and user
    const updatedPost = await Post.findById(postId)
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "firstName lastName fullname username profile.profilePhoto",
        },
      })
      .populate({
        path: "user",
        select: "firstName lastName fullname username profile.profilePhoto",
      });

    // 4. Return full updated post
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error in addComment:", err);
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;
    console.log("🧾 req.params:", req.params);
console.log("🔐 req.user:", req.user);
console.log("🆔 postId:", postId);
console.log("🆔 commentId:", commentId);


    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check ownership
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Remove comment
    await comment.deleteOne();

    // Pull comment reference from post
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId },
    });

    // Return updated post (optional)
    const updatedPost = await Post.findById(postId)
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "firstName lastName fullname username profile.profilePhoto",
        },
      })
      .populate({
        path: "user",
        select: "firstName lastName fullname username profile.profilePhoto",
      });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Failed to delete comment", error: err.message });
  }
};
