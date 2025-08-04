
import {Post} from "../models/post.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";


export const createPost = async (req, res) => {
  try {
    g("📥 Incoming post:", req.body);
    g("📎 Uploaded files:", req.files);

    const { description } = req.body;
    const userId = req.user?._id;

    let imageUrl = "";
    let cloudinaryId = "";

    if (req.files?.image?.[0]) {
      const file = req.files.image[0];
      const fileUri = getDataUri(file);
      g("🔗 File URI:", fileUri);

      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      imageUrl = cloudResponse.secure_url;
      cloudinaryId = cloudResponse.public_id;
    }

    const post = await Post.create({
      description,
      imageUrl,
      cloudinaryId,
      user: userId,
    });

    console.log("✅ Post created:", post);
    res.status(201).json(post);
  } catch (err) {
    console.error("🔥 Post creation error:", err);
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "fullname username profile.profilePhoto")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "fullname username profile.profilePhoto",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ posts }); // ✅ wrapped in object
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user", "fullname username profile.profilePhoto")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "fullname username profile.profilePhoto",
        },
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error fetching post", error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Optionally delete image from Cloudinary
    if (post.cloudinaryId) {
      await cloudinary.uploader.destroy(post.cloudinaryId);
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting post", error: err.message });
  }
};

