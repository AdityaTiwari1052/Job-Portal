import React from 'react';
import Comment from './Comment';

const Comments = ({ post }) => {
  if (!post?.comments || post.comments.length === 0) return null;

  return (
    <div>
      {post.comments.map((comment) => (
        <Comment key={comment._id} comment={comment} postId={post._id}/>
      ))}
    </div>
  );
};

export default Comments;
