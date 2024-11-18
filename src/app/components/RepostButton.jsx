import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../store/useStore";

const RepostButton = ({ postId, onSuccess, setSelectedPost }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [repostContent, setRepostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [originalPostContent, setOriginalPostContent] = useState(""); // Store original post content
  const [originalMedia, setOriginalMedia] = useState(null); // Store original media (image/video URL)
  const { user } = useUser(); // Get the current user from the store

  // Fetch the original post content and media when the modal opens
  useEffect(() => {
    const fetchOriginalPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("post, media") // Fetch post content and media URL
        .eq("id", postId)
        .single(); // Get a single post by ID

      if (error) {
        console.error("Error fetching original post:", error);
      } else {
        setOriginalPostContent(data.post); // Set original content text
        setOriginalMedia(data.media); // Set original media URL
      }
    };

    fetchOriginalPost();
  }, [postId]); // Only run this effect when postId changes

  const handleClose = () => {
    setIsOpen(false);
    setSelectedPost(null);
    setRepostContent(""); // Reset repost content when closing the modal
  };

  const handleRepost = async () => {
    setLoading(true);
    try {
      let originalPostId = postId;
  
      // Check if the postId is for a repost and fetch the original post_id
      const { data: repostData, error: repostError } = await supabase
        .from("reposts")
        .select("post_id") // Select the original post_id
        .eq("repost_id", postId) // Use reposts_id as the identifier
        .single();
  
      if (repostError && repostError.code !== "PGRST116") {
        // PGRST116 means no rows returned; this is not an error for a non-repost post
        throw repostError;
      }
  
      // If postId is a repost, use the original post_id
      if (repostData) {
        originalPostId = repostData.post_id;
      }
  
      // Insert the repost referencing the original post_id
      const { error } = await supabase.from("reposts").insert([
        {
          post_id: originalPostId, // Use the original post_id
          reposter_email: user.email, // Email of the current user reposting
          comment: repostContent, // New content for the repost
        },
      ]);
  
      if (error) {
        throw error; // Throw error if the insertion fails
      }
  
      setRepostContent(""); // Reset repost content field
      handleClose(); // Close the modal
      console.log("Repost successful");
  
      // Execute the onSuccess callback if passed
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error reposting:", error);
    } finally {
      setLoading(false); // Stop the loading indicator
    }
  };
  
  return (
    <div>
      <Modal open={isOpen} onClose={handleClose} className="flex items-center justify-center p-4 z-50">
        <Box className="p-4 bg-slate-800 rounded-lg shadow-lg max-w-full max-h-[90vh] overflow-auto">
          <h2 className="text-lg font-bold mb-4">Add a comment to your repost</h2>
          
          {/* Display original post content */}
          <div className="mb-4">
            <p className="text-gray-300">{originalPostContent}</p>
          </div>

          {/* Display original post media if available */}
          {originalMedia && (
  <div className="mb-4">
    {Array.isArray(originalMedia)
      ? originalMedia.map((mediaUrl, index) => (
          /\.(jpg|jpeg|png|gif)$/i.test(mediaUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={mediaUrl}
              alt="Original media"
              className="w-full h-auto rounded-lg mb-2"
            />
          ) : (
            <video
              key={index}
              controls
              src={mediaUrl}
              className="w-full h-auto rounded-lg mb-2"
            />
          )
        ))
      : /\.(jpg|jpeg|png|gif)$/i.test(originalMedia) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={originalMedia}
            alt="Original media"
            className="w-full h-auto rounded-lg mb-2"
          />
        ) : (
          <video
            controls
            src={originalMedia}
            className="w-full h-auto rounded-lg mb-2"
          />
        )}
  </div>
)}


          {/* Repost content input */}
          <textarea
            value={repostContent}
            onChange={(e) => setRepostContent(e.target.value)}
            placeholder="Add your comment..."
            className="w-full p-2 active:border-0 focus:border-0 outline-0 rounded-lg mb-4 bg-slate-700"
            rows="4"
          ></textarea>

          {/* Repost button */}
          <button
            onClick={handleRepost}
            disabled={loading}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            {loading ? "Reposting..." : "Repost"}
          </button>
        </Box>
      </Modal>
    </div>
  );
};

export default RepostButton;
