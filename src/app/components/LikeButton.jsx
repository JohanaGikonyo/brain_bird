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
    const fetchLikeStatusAndCount = async () => {
      if (!userId || !post.id) return;

      try {
        // Fetch the count of likes for the post
        const { data: likeData, error: likeError } = await supabase
          .from("likes")
          .select("*", { count: "exact" })
          .eq("post_id", post.id);

        if (likeError) {
          console.error("Error fetching like count:", likeError.message);
          return;
        }

        // Set the like count
        setLikeCount(likeData.length);

        // Check if the current user has liked the post
        const { data: userLikeData, error: userLikeError } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", userId)
          .single();

        if (userLikeError && userLikeError.code !== "PGRST116") {
          // "PGRST116" indicates that the user hasn't liked the post yet (no match found)
          console.error("Error fetching user like status:", userLikeError.message);
          return;
        }

        // Update liked status based on whether a record is found for the user
        setLiked(!!userLikeData);
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    };


    if (user) setUserId(user.id);

    fetchLikeStatusAndCount(); // Fetch the like status and count initially
  }, [userId, post.id, user]);

  const handleLike = async () => {
    if (!userId) return; // Ensure user is logged in

    try {
      if (liked) {
        // If the post is already liked, remove the like
        const { error: unlikeError } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", userId);

        if (unlikeError) {
          console.error("Error unliking the post:", unlikeError);
          return;
        }

        setLiked(false); // Update the UI
        setLikeCount((prevCount) => prevCount - 1); // Decrease the like count
      } else {
        // If the post is not liked yet, add the like
        const { error: likeError } = await supabase.from("likes").insert({ post_id: post.id, user_id: userId });

        if (likeError) {
          console.error("Error liking the post:", likeError);
          return;
        }

        setLiked(true); // Update the UI
        setLikeCount((prevCount) => prevCount + 1); // Increase the like count
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <button
      className={`flex items-center space-x-1 ${liked ? "text-blue-500" : "text-gray-400"} rounded-full p-2`}
      onClick={handleLike}
    >
      <FavoriteIcon titleAccess="like" />
      <span>{likeCount}</span>
    </button>
  );
}

export default LikeButton;
