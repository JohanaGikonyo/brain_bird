import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSelected } from "../store/useSection";

const Follow = ({ email, currentUserEmail, postedDate }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const { setSelectedItem, setEmail } = useSelected();

  useEffect(() => {
    const checkIfFollowing = async () => {
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

        if (currentUserData && currentUserData.connections?.includes(email)) {
          setIsFollowing(true);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    checkIfFollowing();
  }, [email, currentUserEmail]);

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
        updatedConnections = currentUserData.connections.filter((conn) => conn !== email);
        setIsFollowing(false);
      } else {
        updatedConnections = [...(currentUserData.connections || []), email];
        setIsFollowing(true);
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ connections: updatedConnections })
        .eq("email", currentUserEmail);

      if (updateError) {
        console.error("Error updating connections:", updateError);
      }
    } catch (error) {
      console.error("An error occurred during follow/unfollow:", error);
    }
  };

  const handleMessage = () => {
    setEmail(email); // Set the email to be passed
    setSelectedItem("Messages"); // Switch to Messages view
  };

  return (
    <div className="flex gap-3">
      <div className="text-gray-400 text-sm mt-2">{postedDate}</div>

      {isFollowing ? (
        <button
          onClick={handleMessage}
          className="text-blue-500 hover:bg-slate-500 rounded-2xl px-4 py-2 active:bg-slate-50"
        >
          Message
        </button>
      ) : (
        <button
          onClick={handleFollow}
          className="text-blue-500 hover:bg-slate-500 rounded-2xl px-4 py-2 active:bg-slate-50"
        >
          Follow
        </button>
      )}
    </div>
  );
};

export default Follow;
