"use client"
import { useState, useEffect, useRef } from "react";
import { usePost, useUser } from "../store/useStore";
import { supabase } from "../lib/supabaseClient";
import { Snackbar, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UserAvatar from "./UserAvatar";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";
// import GifIcon from "@mui/icons-material/Gif";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useSelected } from "../store/useSection";
import EmojiPicker from 'emoji-picker-react'
function UserPost({ postContentToUpdate, setPostContentToUpdate, handleSavePost, editingPost }) {
  const { setSelectedItem } = useSelected();
  const { postContent, setPostContent } = usePost();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]); // Array for storing multiple images/videos
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const emojiPickerRef = useRef(null); // Ref for the emoji picker

  useEffect(() => {
    const handleClickOutside = (event) => {
        // Check if click is outside the emoji or GIF picker
        if (
            emojiPickerRef.current &&
            !emojiPickerRef.current.contains(event.target)
        ) {
            setShowEmojiPicker(false); // Close the emoji picker
        }
        // Uncomment if you want to handle GIF picker
        // if (
        //     gifPickerRef.current &&
        //     !gifPickerRef.current.contains(event.target)
        // ) {
        //     setShowGifPicker(false); // Close the GIF picker
        // }
    };

    // Only add event listener if in client-side
    if (typeof window !== 'undefined') {
        document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
        if (typeof window !== 'undefined') {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    };
}, []);
  // Update postContent when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setPostContent(postContentToUpdate); // Update content for the post when editing
    }
  }, [editingPost, postContentToUpdate, setPostContent]);

  const handlePostChange = (e) => {
    if (editingPost) {
      setPostContentToUpdate(e.target.value);
    } else {
      setPostContent(e.target.value);
    }
  };

  const handleMediaUpload = async (files) => {
    const base64Paths = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
              const base64Data = reader.result.split(",")[1]; // Extract base64 string
              let prefix = "";

              if (file.type.startsWith("image")) {
                prefix = "data:image/jpeg;base64,";
              } else if (file.type.startsWith("video")) {
                prefix = "data:video/mp4;base64,";
              }

              resolve(prefix + base64Data);
            };
            reader.onerror = (error) => {
              console.error("Error reading file:", error);
              setSnackbarMessage("There was an error reading the file.");
              setOpenSnackbar(true);
              reject(null);
            };
          })
      )
    );

    return base64Paths;
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && mediaFiles.length === 0) return;

    setLoading(true);
    setSnackbarMessage("");

    let base64MediaPaths = null;
    if (mediaFiles.length > 0) {
      base64MediaPaths = await handleMediaUpload(mediaFiles);
    }

    if (editingPost) {
      // If we're editing, update the post
      const { data, error } = await supabase
        .from("posts")
        .update({
          post: postContent,
          media: base64MediaPaths,
        })
        .match({ id: editingPost }); // Match the post by its ID

      setLoading(false);

      if (error) {
        console.error("Error updating post:", error);
        setSnackbarMessage("There was an error updating your post.");
        setOpenSnackbar(true);
      } else {
        console.log("Post updated successfully:", data);
        setSnackbarMessage("Post Updated Successfully");
        setOpenSnackbar(true);
        handleSavePost(); // Call the passed-in save function to reset the editing state
      }
    } else {
      // If creating a new post
      const { data, error } = await supabase.from("posts").insert([
        {
          post: postContent,
          email: user.email,
          username: user.user_metadata?.full_name,
          media: base64MediaPaths,
        },
      ]);

      setLoading(false);

      if (error) {
        console.error("Error inserting post:", error);
        setSnackbarMessage("There was an error posting your content.");
        setOpenSnackbar(true);
      } else {
        console.log("Post submitted successfully:", data);
        setSnackbarMessage("Post Submitted Successfully");
        setOpenSnackbar(true);
        setPostContent("");
        setMediaFiles([]);
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("video")) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
          if (video.duration <= 180) {
            setMediaFiles((prevFiles) => [...prevFiles, file]);
          } else {
            setSnackbarMessage("Video must be less than or equal to 3 mins.");
            setOpenSnackbar(true);
          }
        };
      } else if (file.type.startsWith("image")) {
        setMediaFiles((prevFiles) => [...prevFiles, file]);
      } else {
        setSnackbarMessage("Invalid file type. Please upload images or videos.");
        setOpenSnackbar(true);
      }
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  

  const handleEmojiClick = ( event,emojiObject) => {
    event.preventDefault(event);
    console.log(emojiObject)
    if (!emojiObject || !emojiObject.emoji) {
      console.error("Emoji object is undefined or invalid");
      return;
  }
    const updatedContent = editingPost
      ? postContentToUpdate + emojiObject.emoji
      : postContent + emojiObject.emoji;
    if (editingPost) {
      setPostContentToUpdate(updatedContent);
    } else {
      setPostContent(updatedContent);
    }
    setShowEmojiPicker(false); // Close the emoji picker after selection
  };

  // const handleGifSelect = (e,gif) => {
  //   e.preventDefault(e);
  //   console.log(gif)
  //   setMediaFiles((prevFiles) => [...prevFiles, gif.images.original.url]);
  //   setShowGifPicker(false); // Close the GIF picker after selection
  // };
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
    if (showGifPicker) setShowGifPicker(false); // Ensure GIF picker is closed
  };

  // const toggleGifPicker = () => {
  //   setShowGifPicker((prev) => !prev);
  //   if (showEmojiPicker) setShowEmojiPicker(false); // Ensure emoji picker is closed
  // };
  return (
    <div className="max-w-2xl mx-auto p-4 border-b border-b-slate-800 w-full shadow-md">
      <div onClick={() => setSelectedItem("profile")} className="cursor-pointer">
        <UserAvatar />
      </div>
      {showEmojiPicker && (
        <div className="absolute z-10" ref={emojiPickerRef}>
<EmojiPicker onEmojiClick={(event, emojiObject) => handleEmojiClick(event, emojiObject)} />
</div>
      )}

      {showGifPicker && (
        <div className="absolute z-10">
          {/* <GiphySelector onGifSelected={(e, gif)=>handleGifSelect(e, gif)} /> */}
        </div>
      )}

      <div className="flex items-center mb-4">
        <div className="flex-grow ml-4">
          <textarea
            value={postContentToUpdate ? postContentToUpdate : postContent}
            onChange={handlePostChange}
            placeholder="What's happening?"
            rows="1"
            className="w-full p-2 rounded-lg focus:outline-none focus:ring-0 bg-transparent text-white placeholder-gray-400 text-lg resize-none overflow-hidden"
          ></textarea>
        </div>
      </div>
      {/* Preview selected media */}
      <div className="flex flex-wrap gap-2 mb-4">
  {mediaFiles.map((file, index) => (
    <div key={index} className="relative">
      {file.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file} alt="GIF" className="w-20 h-20 object-cover rounded-lg" />
      ) : file.type.startsWith("image") ? (
        <Image
          height={200}
          width={200}
          src={URL.createObjectURL(file)}
          alt="preview"
          className="w-20 h-20 object-cover rounded-lg"
        />
      ) : (
        <video
          height={200}
          width={200}
          src={URL.createObjectURL(file)}
          controls
          className="w-20 h-20 object-cover rounded-lg"
        />
      )}
    </div>
  ))}
</div>

      {/* Action icons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <label htmlFor="media-upload">
            <IconButton color="primary" component="span">
              <AddIcon fontSize="small" />
            </IconButton>
          </label>
          <input
            type="file"
            id="media-upload"
            accept="image/*,video/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <IconButton color="primary" onClick={toggleEmojiPicker}>
            <EmojiEmotionsIcon fontSize="small" />
          </IconButton>
{/* 
          <IconButton color="primary"  onClick={toggleGifPicker}>
            <GifIcon fontSize="small" />
          </IconButton> */}

         
        </div>

        {/* Post button */}
        {editingPost ? (
          <button
            onClick={handleSavePost}
            disabled={!postContentToUpdate || (!postContentToUpdate.trim() && mediaFiles.length === 0) || loading}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading && <CircularProgress size={24} className="mr-2" color="inherit" />}
            Save
          </button>
        ) : (
          <button
            onClick={handlePostSubmit}
            disabled={!postContent || (!postContent.trim() && mediaFiles.length === 0) || loading}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading && <CircularProgress size={24} className="mr-2" color="inherit" />}
            Post
          </button>
        )}
      </div>

      {/* Snackbar for status updates */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
}

export default UserPost;
