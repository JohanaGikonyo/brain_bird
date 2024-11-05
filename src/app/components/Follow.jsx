import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const Follow = ({ email, currentUserEmail, setFollowersNumber, postedDate }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkIfFollowing = async () => {
      try {
        // Check if the current user is already following the given email
        const { data: currentUserData, error: currentUserError } = await supabase
          .from("users")
          .select("connections")
          .eq("email", currentUserEmail)
          .single();

        if (currentUserError) {
          console.error("Error fetching current user connections:", currentUserError);
          return;
        }

        if (currentUserData && currentUserData.connections?.includes(email)) {
          setIsFollowing(true);
        }

        // Retrieve follower count only for the specified email
        const { data: followerData, error: followerError } = await supabase.from("users").select("connections");

        if (followerError) {
          console.error("Error fetching followers:", followerError);
          return;
        }

        // Filter only users who have this email in their connections array
        const followerCount = followerData.filter((user) => user.connections?.includes(email)).length;
        setFollowersNumber(followerCount);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    checkIfFollowing();
  }, [email, currentUserEmail, setFollowersNumber]);

  const handleFollow = async () => {
    try {
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("users")
        .select("connections")
        .eq("email", currentUserEmail)
        .single();

      if (currentUserError) {
        console.error("Error fetching current user connections:", currentUserError);
        return;
      }

      let updatedConnections;

      if (isFollowing) {
        // Unfollow: Remove the followed user from the current user's connections
        updatedConnections = currentUserData.connections.filter((conn) => conn !== email);
        setIsFollowing(false);
      } else {
        // Follow: Add the followed user to the current user's connections
        updatedConnections = [...(currentUserData.connections || []), email];
        setIsFollowing(true);
      }

      // Update the current user's connections in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({ connections: updatedConnections })
        .eq("email", currentUserEmail);

      if (updateError) {
        console.error("Error updating connections:", updateError);
        return;
      }

      // Recalculate the follower count specifically for the specified email
      const { data: followerData, error: followerError } = await supabase.from("users").select("connections");

      if (followerError) {
        console.error("Error fetching followers after update:", followerError);
        return;
      }

      const followerCount = followerData.filter((user) => user.connections?.includes(email)).length;
      setFollowersNumber(followerCount);
    } catch (error) {
      console.error("An error occurred during follow/unfollow:", error);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="text-gray-400 text-sm mt-2">{postedDate}</div>
      <button
        onClick={handleFollow}
        className="text-blue-500 hover:bg-slate-500 rounded-2xl px-4 py-2 active:bg-slate-50"
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default Follow;
