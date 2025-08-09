import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "./ui/textarea";
import { Images } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "@/utils/apiClient";
import { addPost } from "@/redux/postSlice"; // Import post action

export function PostDialog({ setOpen, open, refreshPosts }) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleTextChange = (e) => setInputText(e.target.value);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("description", inputText);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      console.log('Creating post with:', {
        description: inputText,
        hasImage: !!selectedFile
      });

      // Make sure we're using the correct endpoint without duplicating /api/v1
      const { data } = await apiClient.post("/posts", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post created successfully:', data);
      dispatch(addPost(data.post));
      toast.success("Post created!");
      setOpen(false);
      setInputText("");
      setSelectedFile(null);
      setPreviewUrl("");
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error("Post creation failed:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to create post");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profile?.profilePhoto} />
              <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1>{user?.fullname}</h1>
              <p className="text-xs">Post to anyone</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="What's on your mind?"
            className="text-base"
          />

          {previewUrl && (
            <img src={previewUrl} alt="preview" className="rounded-lg" />
          )}

          <DialogFooter>
            <input
              type="file"
              ref={inputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" onClick={() => inputRef.current.click()}>
              <Images className="mr-2 text-blue-500" />
              Add Media
            </Button>
            <Button onClick={handleSubmit}>Post</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
