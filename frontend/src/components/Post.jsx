import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import ReactTimeago from "react-timeago";
import PostContent from "./PostContent";
import SocialOptions from "./SocialOptions";
import apiClient from "../utils/apiClient";

const Post = ({ post, refreshPosts }) => {
  const { user } = useSelector((state) => state.auth);
  const loggedInUser = user?._id === post?.user?._id;

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user && post?.user?.followers) {
      const isUserFollowing = post.user.followers.some(follower => 
        (typeof follower === 'object' ? follower._id : follower) === user._id
      );
      setIsFollowing(isUserFollowing);
    }
  }, [user, post?.user?.followers]);

  const handleFollowToggle = async () => {
    try {
      const res = await apiClient.post(`/api/v1/user/${post.user._id}/follow`);
      setIsFollowing(res.data.following);
      toast.success(res.data.following ? "Followed ✅" : "Unfollowed 🚫");
      refreshPosts();
    } catch (error) {
      toast.error("Follow action failed ❌");
      console.error("Error following/unfollowing user:", error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await apiClient.delete(`/posts/${postId}`);
      toast.success("Post deleted successfully ✅");
      refreshPosts();
    } catch (error) {
      toast.error("Failed to delete post ❌");
      console.error("❌ Failed to delete post:", error);
    }
  };

  return (
    <div className="bg-white my-2 mx-2 md:mx-0 rounded-lg border border-gray-300">
      <div className="flex gap-2 p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post?.user?.profile?.profilePhoto} />
          <AvatarFallback>
            {post?.user?.fullname?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-sm font-bold">
              {post?.user?.fullname}
              {loggedInUser && (
                <Badge variant="secondary" className="ml-2">
                  You
                </Badge>
              )}
            </h1>
            <h1 className="text-xs text-gray-500">@{post?.user?.username}</h1>
            <p className="text-xs text-gray-500">
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!loggedInUser && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollowToggle}
                className={isFollowing ? 'text-gray-600' : ''}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            {loggedInUser && (
              <Button
                size="icon"
                className="rounded-full"
                variant="outline"
                onClick={() => handleDelete(post._id)}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      </div>

      <PostContent post={post} />
      <SocialOptions post={post} />
    </div>
  );
};

export default Post;
