import { useState } from "react";
import { usePost, useUserAvatarUrl, useUser, useUserName } from "../store/useStore";
import { supabase } from "../lib/supabaseClient";
import { Snackbar, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UserAvatar from "./UserAvatar";
import { getNameFromEmail } from "../utils/userUtils";
import FetchCurrentUser from "./fetchCurrentUser";
function UserPost() {
  const { postContent, setPostContent } = usePost();
  const { user } = useUser();
  const { userAvatar } = useUserAvatarUrl();
  const { username } = useUserName();
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handlePostChange = (e) => {
    setPostContent(e.target.value);
  };

  const handlePostSubmit = async () => {
    // console.log(user);
    if (!postContent.trim()) return;

    // Ensure the user is logged in
    if (!user) {
      console.error("No user found. Please log in.");
      return;
    }

    setLoading(true);
    setSnackbarMessage(""); // Reset snackbar message

    // Insert post into the posts table
    const { data, error } = await supabase.from("posts").insert([
      {
        post: postContent, // Post content
        email: user.email, // The email of the logged-in user
        username: username, // The extracted username
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
      setPostContent(""); // Clear the input after submission
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 border-b border-b-slate-800 w-full shadow-md">
      <FetchCurrentUser /> {/* Fetches user info when the component is mounted */}
      <div className="flex items-center mb-4">
        <div className="hover:cursor-pointer">
          <UserAvatar
            avatarUrl={userAvatar}
            name={user ? getNameFromEmail(user.email) : "G"}
            email={user?.email}
            color="blue"
          />
        </div>
        <div className="flex-grow ml-4">
          <textarea
            value={postContent}
            onChange={(e) => {
              handlePostChange(e);
              e.target.style.height = "auto"; // Reset height
              e.target.style.height = `${e.target.scrollHeight}px`; // Set new height based on scroll height
            }}
            placeholder="What's happening?"
            rows="1" // Start with a single row
            className="w-full p-2 rounded-lg focus:outline-none focus:ring-0 bg-transparent text-white placeholder-gray-400 text-lg resize-none overflow-hidden"
          ></textarea>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-gray-400 mb-0">@{getNameFromEmail(user?.email) || "Guest"}</div>

        <button
          onClick={handlePostSubmit}
          disabled={!postContent.trim() || loading}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {loading && <CircularProgress size={24} className="mr-2" color="white" />}
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
