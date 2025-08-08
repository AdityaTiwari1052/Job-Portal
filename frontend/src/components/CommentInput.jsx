import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '@/utils/apiClient';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { updateSinglePost } from '@/redux/postSlice'
import { toast } from 'sonner';

const CommentInput = ({ postId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [text, setText] = useState('');

  const commentActionHandler = async (e) => {
  e.preventDefault();

  if (!user) {
    toast.error('You must be logged in to comment.');
    return;
  }

  if (!text.trim()) return;

  try {
    const { data } = await apiClient.post(
      `/api/v1/posts/${postId}/comments`,
      { textMessage: text }
    );

    toast.success("Message sent");
    setText('');
    dispatch(updateSinglePost(data)); // ✅ updated post with new comment
  } catch (err) {
    console.error('Error adding comment:', err);
    toast.error('Failed to add comment.');
  }
};


  return (
    <form onSubmit={commentActionHandler}>
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.profile?.profilePhoto} />
          <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
        </Avatar>
        <Input
          type="text"
          name="inputText"
          placeholder="Add a comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded-full"
        />
        <Button type="submit" variant="outline" className="rounded-full">
          Send
        </Button>
      </div>
    </form>
  );
};

export default CommentInput;
