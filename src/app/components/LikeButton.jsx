import React, { useState, useEffect } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../store/useStore";

function LikeButton({ post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { user } = useUser();
  const [userId, setUserId] = useState(null);

  // Fetch like status and count whenever userId or post.id changes
  useEffect(() => {
    // Ensure userId is available before fetching like status
    const fetchLikeStatus = async () => {
      if (!userId || !post.id) return;

      try {
        const { data, error } = await supabase.from("posts").select("liked").eq("id", post.id).single();

        if (error) {
          console.error("Error fetching like status:", error);
          return;
        }

        const likedUsers = data.liked || [];
        setLiked(likedUsers.includes(userId));
        setLikeCount(likedUsers.length); // Update the like count
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    if (user) setUserId(user.id);

    fetchLikeStatus(); // Fetch the like status initially

    // Optional: Real-time polling for updates every 1 seconds
    const interval = setInterval(fetchLikeStatus, 1000);

    return () => clearInterval(interval); // Cleanup interval when component unmounts
  }, [userId, post.id, user]);

  const handleLike = async () => {
    if (!userId) return; // Ensure userId is set

    try {
      const { data, error } = await supabase.from("posts").select("liked").eq("id", post.id).single();

      if (error) {
        console.error("Error fetching like status:", error);
        return;
      }

      const likedUsers = data.liked || [];
      const isLiked = likedUsers.includes(userId);

      // Toggle like status
      const newLikedUsers = isLiked
        ? likedUsers.filter((id) => id !== userId) // Remove the like
        : [...likedUsers, userId]; // Add the like

      const { error: updateError } = await supabase.from("posts").update({ liked: newLikedUsers }).eq("id", post.id);

      if (updateError) {
        console.error("Error updating like status:", updateError);
        return;
      }

      setLiked(!isLiked); // Update the UI
      setLikeCount(newLikedUsers.length); // Update the like count
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <button
      className={`flex items-center space-x-1 ${liked ? "text-red-500" : "text-gray-400"} rounded-full p-2`}
      onClick={handleLike}
    >
      <FavoriteIcon titleAccess="like" />
      <span>{likeCount}</span> {/* Display the number of likes */}
    </button>
  );
}

export default LikeButton;
