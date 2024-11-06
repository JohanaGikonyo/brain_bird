import { useState } from "react";
import { usePost, useUser } from "../store/useStore";
import { supabase } from "../lib/supabaseClient";
import { Snackbar, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UserAvatar from "./UserAvatar";
import Image from "next/image";
// import ImageIcon from "@mui/icons-material/Image";
import AddIcon from "@mui/icons-material/Add"; // For adding more photos
import GifIcon from "@mui/icons-material/Gif";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import PollIcon from "@mui/icons-material/Poll";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useSelected } from "../store/useSection";

function UserPost() {
  const { setSelectedItem } = useSelected();
  const { postContent, setPostContent } = usePost();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]); // Array for storing multiple images/videos

  const handlePostChange = (e) => {
    setPostContent(e.target.value);
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

  return (
    <div className="max-w-2xl mx-auto p-4 border-b border-b-slate-800 w-full shadow-md">
      <div onClick={() => setSelectedItem("profile")} className="cursor-pointer"
      ><UserAvatar /></div>
      <div className="flex items-center mb-4">
        <div className="flex-grow ml-4">
          <textarea
            value={postContent}
            onChange={(e) => {
              handlePostChange(e);
              e.target.style.height = "auto"; // Reset height
              e.target.style.height = `${e.target.scrollHeight}px`; // Set new height based on scroll height
            }}
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
            {file.type.startsWith("image") ? (
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
          <IconButton color="primary">
            <GifIcon fontSize="small" />
          </IconButton>
          <IconButton color="primary">
            <EmojiEmotionsIcon fontSize="small" />
          </IconButton>
          <IconButton color="primary">
            <PollIcon fontSize="small" />
          </IconButton>

          <IconButton color="primary">
            <LocationOnIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Post button */}
        <button
          onClick={handlePostSubmit}
          disabled={(!postContent.trim() && mediaFiles.length === 0) || loading}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {loading && <CircularProgress size={24} className="mr-2" color="inherit" />}
          Post
        </button>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon />
          </IconButton>
        }
      />
    </div>
  );
}

export default UserPost;
