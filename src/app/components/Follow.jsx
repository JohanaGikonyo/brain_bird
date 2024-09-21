import React, { useState, useEffect } from "react";
import { useUser } from "../store/useStore";
import { supabase } from "../lib/supabaseClient";

function Follow({ post }) {
  const [following, setFollowing] = useState(false);
  const { user } = useUser();
  const follower_email = user.email;
  const followed_email = post.email;

  useEffect(() => {
    let interval;

    async function checkFollowingStatus() {
      const { data, error } = await supabase
        .from("users")
        .select("followed_email")
        .eq("email", follower_email)
        .maybeSingle();

      if (error) {
        console.log("The User is: ", user);
        console.error("Error checking follow status:", error);
      } else {
        const isFollowing = data?.followed_email?.includes(followed_email);
        setFollowing(isFollowing);
      }
    }

    // Check follow status initially
    checkFollowingStatus();

    // Set up polling
    interval = setInterval(checkFollowingStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [follower_email, followed_email, user]);

  const handleFollowToggle = async () => {
    const { data, error } = await supabase.from("users").select("followed_email").eq("email", follower_email).single();

    if (error) {
      if (error.message.includes("no rows")) {
        // Create a default entry if no row exists
        const { error: insertError } = await supabase
          .from("users")
          .insert([{ email: follower_email, followed_email: [] }]);

        if (insertError) {
          console.error("Error creating follow entry:", insertError);
          return;
        }
        // Retry fetching data
        const { data: newData, error: fetchError } = await supabase
          .from("users")
          .select("followed_email")
          .eq("email", follower_email)
          .single();

        if (fetchError) {
          console.error("Error fetching newly created follow data:", fetchError);
          return;
        }
        const followedEmails = newData?.followed_email || [];
        handleFollowUpdate(followedEmails);
      } else {
        console.log("The User is: ", user);

        console.error("Error fetching follow data:", error);
      }
    } else {
      const followedEmails = data?.followed_email || [];
      handleFollowUpdate(followedEmails);
    }
  };

  const handleFollowUpdate = async (followedEmails) => {
    if (following) {
      // Unfollow: Remove followed_email from array
      const updatedEmails = followedEmails.filter((email) => email !== followed_email);

      const { error } = await supabase
        .from("users")
        .update({ followed_email: updatedEmails })
        .eq("email", follower_email);

      if (error) {
        console.error("Error unfollowing:", error);
      } else {
        setFollowing(false);
      }
    } else {
      // Follow: Add followed_email to array
      const updatedEmails = [...followedEmails, followed_email];

      const { error } = await supabase
        .from("users")
        .update({ followed_email: updatedEmails })
        .eq("email", follower_email);

      if (error) {
        console.error("Error following:", error);
      } else {
        console.log("Follow up added!");
        setFollowing(true);
      }
    }
  };

  return (
    <button onClick={handleFollowToggle} className="btn">
      {following ? "Unfollow" : "Follow"}
    </button>
  );
}

export default Follow;
