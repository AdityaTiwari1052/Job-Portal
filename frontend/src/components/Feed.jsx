import React, { useEffect } from "react";
import apiClient from "@/utils/apiClient";
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
      console.log("🔍 [Feed] Starting to fetch posts...");
      
      // Add a small delay to help with debugging
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await apiClient.get("/posts");
      console.log("📦 [Feed] Raw API response:", response);
      
      if (!response) {
        throw new Error("No response received from the server");
      }
      
      // Log the full response structure
      console.log("🔍 [Feed] Response data structure:", {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        hasPostsProp: response.data ? 'posts' in response.data : false,
        postsType: response.data?.posts ? typeof response.data.posts : 'no posts'
      });
      
      // Handle different response formats
      let posts = [];
      
      if (Array.isArray(response.data)) {
        // Case: response.data is already an array
        posts = response.data;
      } else if (response.data && Array.isArray(response.data.posts)) {
        // Case: response.data has a posts array
        posts = response.data.posts;
      } else if (response.data && typeof response.data === 'object') {
        // Case: response.data is an object, convert to array
        posts = [response.data];
      }
      
      console.log(`📝 [Feed] Processed ${posts.length} posts`);
      
      // Validate posts structure
      const validPosts = posts.filter(post => {
        const isValid = post && typeof post === 'object' && post._id;
        if (!isValid) {
          console.warn("⚠️ [Feed] Invalid post structure:", post);
        }
        return isValid;
      });
      
      console.log(`✅ [Feed] Dispatching ${validPosts.length} valid posts to Redux`);
      dispatch(setPosts(validPosts));
      
    } catch (error) {
      console.error("❌ [Feed] Error in refreshPosts:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers
        } : 'No config'
      });
      
      toast.error("Failed to load posts. Please try again later.");
      dispatch(setPosts([]));
    }
  };

  useEffect(() => {
    console.log("🔄 Feed component mounted, refreshing posts...");
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
