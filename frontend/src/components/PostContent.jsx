import React from "react";

const PostContent = ({ post }) => {
  if (!post) return null;

  const { description, imageUrl } = post;

  return (
    <div className="px-4 pb-4">
      {description && (
        <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
          {description}
        </p>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post content"
          className="w-full rounded-md max-h-[500px] object-cover"
        />
      )}
    </div>
  );
};

export default PostContent;
