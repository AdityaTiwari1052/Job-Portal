import React from 'react';
import Post from './Post';
import { toast } from 'sonner';

const Posts = ({ posts = [], refreshPosts }) => {
  console.log("📝 Rendering Posts component with posts:", posts);
  
  // Ensure posts is an array
  const safePosts = Array.isArray(posts) ? posts : [];
  
  // Filter out any invalid posts
  const filteredPosts = safePosts.filter((post) => {
    const isValid = post && post._id;
    if (!isValid) {
      console.warn("⚠️ Found invalid post:", post);
    }
    return isValid;
  });
  
  console.log(`🔢 Filtered ${filteredPosts.length} valid posts out of ${safePosts.length} total`);

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No posts available.</p>
        <p className="text-gray-400 text-sm mt-2">Be the first to share something!</p>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <Post 
            key={post._id} 
            post={post} 
            refreshPosts={refreshPosts} 
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error("❌ Error rendering posts:", error);
    toast.error("Error displaying posts. Please refresh the page.");
    return (
      <div className="text-center py-8 text-red-500">
        Something went wrong while loading posts. Please try refreshing the page.
      </div>
    );
  }
};

export default React.memo(Posts);
