import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import PostInput from "./PostInput";
import Posts from "./Posts";
import { setPosts } from "@/redux/postSlice";

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const posts = useSelector((state) => state.post.posts);

  const refreshPosts = async () => {
    try {
      const { data } = await axios.get("https://job-portal-v3b1.onrender.com/api/posts");
      dispatch(setPosts(data.posts || []));

    } catch (error) {
      console.error("Error fetching posts:", error.message);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PostInput user={user} refreshPosts={refreshPosts} />
      <Posts posts={posts}  refreshPosts={refreshPosts}/>
    </div>
  );
};

export default Feed;
