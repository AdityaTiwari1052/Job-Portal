// routes/post.routes.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { multiUpload } from "../middlewares/multer.js";


import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
} from "../controllers/post.controller.js";

import { addComment ,deleteComment} from "../controllers/comment.controller.js";
import { toggleLike } from "../controllers/like.controller.js";

const router = express.Router();

// ✅ Post Routes
router.post("/", isAuthenticated, multiUpload, createPost);
router.get("/", getAllPosts);
router.get("/:postId", getPostById);
router.delete("/:postId", isAuthenticated, deletePost);

router.post("/:postId/comments", isAuthenticated, addComment);
router.delete("/:postId/comments/:commentId", isAuthenticated, deleteComment);

router.post("/:postId/like", isAuthenticated, toggleLike);


export default router;
