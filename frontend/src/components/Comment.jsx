import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import ReactTimeago from 'react-timeago';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { updateSinglePost } from '@/redux/postSlice'; // if you're using it

const Comment = ({ comment, postId }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!comment || !comment.user) return null;

  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(
        
        `https://job-portal-v3b1.onrender.com/api/posts/${postId}/comments/${comment._id}`,
        { withCredentials: true }
      );
      toast.success("Comment deleted ✅");
      dispatch(updateSinglePost(data)); // updated post returned from backend
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment ❌");
    }
  };

  const isCommentOwner = user?._id === comment.user._id;

  return (
    <div className="flex gap-2 my-4">
      <div className="mt-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user?.profile?.profilePhoto} />
          <AvatarFallback>{comment.user?.fullname?.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-1 justify-between p-3 bg-[#F2F2F2] rounded-lg">
        <div>
          <h1 className="text-sm font-medium">
            {comment.user.firstName} {comment.user.lastName}
          </h1>
          <p className="text-xs text-gray-500">@{comment.user.firstName}</p>
          <p className="my-2">{comment.textMessage}</p>
        </div>

        <div className="flex flex-col items-end justify-between">
          <p className="text-xs text-gray-500">
            <ReactTimeago date={new Date(comment.createdAt)} />
          </p>
          {isCommentOwner && (
            <Trash2
              className="h-4 w-4 text-gray-500 hover:text-red-500 cursor-pointer"
              onClick={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
