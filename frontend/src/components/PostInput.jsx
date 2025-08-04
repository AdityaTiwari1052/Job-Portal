import React, { useState } from "react";
import { Input } from "./ui/input";
import { PostDialog } from "./PostDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const PostInput = ({ user, refreshPosts }) => {
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="bg-white p-4 m-2 md:m-0 border border-gray-300 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profile?.profilePhoto} alt="Profile" />
          <AvatarFallback>{user.fullname?.charAt(0)}</AvatarFallback>
        </Avatar>
        <Input
          type="text"
          placeholder="Start a post"
          className="rounded-full hover:bg-gray-100 h-12 cursor-pointer"
          onClick={() => setOpen(true)}
        />
        <PostDialog
          setOpen={setOpen}
          open={open}
          src={user?.imageUrl}
          refreshPosts={refreshPosts}
        />
      </div>
    </div>
  );
};

export default PostInput;
