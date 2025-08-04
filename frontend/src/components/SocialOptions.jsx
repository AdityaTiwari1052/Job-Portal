import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { MessageCircleMore, Repeat, Send, ThumbsUp } from 'lucide-react';
import CommentInput from './CommentInput';
import Comments from './Comments';
import axios from 'axios';
import { toast } from 'sonner';


const SocialOptions = ({ post }) => {
  const user = useSelector((state) => state.auth.user);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likes, setLikes] = useState(post.likes || []);
  const [commentOpen, setCommentOpen] = useState(false);

  const likeOrDislikeHandler = async () => {
    if (!user) {
      toast.error("You must be logged in to like a post.");
      return;
    }

    const prevLiked = liked;
    const prevLikes = likes;

    const updatedLikes = liked
      ? likes.filter((id) => id !== user._id)
      : [...likes, user._id];

    setLiked(!liked);
    setLikes(updatedLikes);

    try {
      await axios.post(`http://localhost:8000/api/posts/${post._id}/like`, 
        {
        userId: user._id},
        { withCredentials: true }
      );

      toast.success(liked ? "Disliked post" : "Liked post");

      // Optionally fetch fresh likes count (if backend returns updated data)
      const { data } = await axios.get(`http://localhost:8000/api/posts/${post._id}`,
        { withCredentials: true }
      );
      setLikes(data.likes || []);
    } catch (error) {
      setLiked(prevLiked);
      setLikes(prevLikes);
      console.error("Like/dislike failed:", error);
      toast.error("Failed to update like.");
    }
  };

  return (
    <div>
      <div className="text-sm mx-2 p-2 flex items-center justify-between border-b border-gray-300">
        {likes.length > 0 && (
          <p className="text-xs text-gray-500 hover:text-blue-500 hover:underline hover:cursor-pointer">
            {likes.length} likes
          </p>
        )}
        {post.comments?.length > 0 && (
          <p
            onClick={() => setCommentOpen(!commentOpen)}
            className="text-xs text-gray-500 hover:text-blue-500 hover:underline hover:cursor-pointer"
          >
            {post.comments.length} message{post.comments.length > 1 && "s"}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between overflow-x-auto px-1 no-scrollbar">
  <Button
    onClick={likeOrDislikeHandler}
    variant="ghost"
    className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
  >
    <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-[#378FE9]' : ''}`} />
    <span className={`${liked ? 'text-[#378FE9]' : ''}`}>Like</span>
  </Button>

  <Button
    onClick={() => setCommentOpen(!commentOpen)}
    variant="ghost"
    className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
  >
    <MessageCircleMore className="w-4 h-4" />
    <span>Message</span>
  </Button>

  <Button
    variant="ghost"
    className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
  >
    <Repeat className="w-4 h-4" />
    <span>Repost</span>
  </Button>

  <Button
    variant="ghost"
    className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
  >
    <Send className="w-4 h-4" />
    <span>Send</span>
  </Button>
</div>


      {commentOpen && (
        <div className="p-4">
          <CommentInput postId={post._id} />
          <Comments post={post} />
        </div>
      )}
    </div>
  );
};

export default SocialOptions;
