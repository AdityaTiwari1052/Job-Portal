import {Post} from "../models/post.model.js";

export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({ liked: !liked, totalLikes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Error toggling like", error: err.message });
  }
};
