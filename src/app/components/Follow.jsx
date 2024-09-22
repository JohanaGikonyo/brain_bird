import React, { useState, useEffect } from "react";
import { useUser } from "../store/useStore";
import { supabase } from "../lib/supabaseClient";

function Follow({ post }) {
  const [following, setFollowing] = useState(false);
  const { user } = useUser();
  const followerEmail = user?.email; // Email of the user performing the follow action
  const followedEmail = post?.email; // Email of the user to be followed

  // Fetch follow status when component mounts or emails change
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!followerEmail || !followedEmail) return;

      try {
        const { data, error } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_email", followerEmail)
          .eq("followed_email", followedEmail)
          .single();

        if (error && error.code !== "PGRST116") {
          // Handle unexpected errors (ignore if the relationship doesn't exist)
          console.error("Error checking follow status:", error.message);
          return;
        }

        setFollowing(!!data); // Set following to true if a follow relationship exists
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    };

    checkFollowStatus();
  }, [followerEmail, followedEmail]);

  const handleFollowToggle = async () => {
    if (!followerEmail || !followedEmail) return;

    try {
      if (following) {
        // Unfollow: Delete the follow relationship
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_email", followerEmail)
          .eq("followed_email", followedEmail);

        if (error) {
          console.error("Error unfollowing:", error.message);
          return;
        }

        setFollowing(false); // Update UI after unfollowing
      } else {
        // Follow: Insert a new follow relationship
        const { error } = await supabase
          .from("follows")
          .insert({ follower_email: followerEmail, followed_email: followedEmail });

        if (error) {
          console.error("Error following:", error.message);
          return;
        }

        setFollowing(true); // Update UI after following
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
    }
  };

  return (
    <button onClick={handleFollowToggle} className="btn">
      {following ? "Unfollow" : "Follow"}
    </button>
  );
}

export default Follow;
