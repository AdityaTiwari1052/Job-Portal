import React from 'react';
import Post from './Post';

const Posts = ({ posts,refreshPosts }) => {
  if (!Array.isArray(posts)) return null;

  return (
    <div>
      {posts
        .filter((post) => post && post._id) // ✅ Make sure post and _id exist
        .map((post) => (
          <Post key={post._id} post={post} refreshPosts={refreshPosts} />
        ))}
    </div>
  );
};

export default Posts;
