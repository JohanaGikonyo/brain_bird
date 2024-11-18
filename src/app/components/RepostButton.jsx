import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../store/useStore";

const RepostButton = ({ postId, postEmail, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [repostContent, setRepostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [originalPostContent, setOriginalPostContent] = useState("");
  const [originalMedia, setOriginalMedia] = useState(null); // To store the original media URL
  const { user } = useUser();

  // Fetch the original post content and media when modal opens
  useEffect(() => {
    const fetchOriginalPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("post, media") // Fetch both text and media
        .eq("id", postId)
        .single();

      if (error) {
        console.error("Error fetching original post:", error);
      } else {
        setOriginalPostContent(data.post);
        setOriginalMedia(data.media); // Store media URL directly
      }
    };

    fetchOriginalPost();
  }, [postId]);

  const handleClose = () => {
    setIsOpen(false);
    setRepostContent("");
  };

  const handleRepost = async () => {
    setLoading(true);
    try {
      const fullRepostContent = `${originalPostContent}\n\nReposted: ${repostContent}`;

      const { error } = await supabase.from("posts").insert([
        {
          post: fullRepostContent,
          email: postEmail,
          original_post_id: postId,
          reposter_email: user.email,
          media: originalMedia, // Include original media if available
        },
      ]);

      if (error) {
        throw error;
      }

      setRepostContent("");
      handleClose();
      console.log("Repost successful");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error reposting:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Modal open={isOpen} onClose={handleClose} className="flex items-center justify-center p-4 z-50">
        <Box className="p-4 bg-slate-800 rounded-lg shadow-lg max-w-full max-h-[90vh] overflow-auto">
          <h2 className="text-lg font-bold mb-4">Add a comment to your repost</h2>
          
          {/* Display original post media if it exists */}
          {originalMedia && (
            <div className="mb-4">
              {/* Check if media is an image or video by file extension */}
              {/\.(jpg|jpeg|png|gif)$/i.test(originalMedia) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={originalMedia} alt="Original media" className="w-full h-auto rounded-lg" />
              ) : (
                <video controls src={originalMedia} className="w-full h-auto rounded-lg" />
              )}
            </div>
          )}

          <textarea
            value={repostContent}
            onChange={(e) => setRepostContent(e.target.value)}
            placeholder="Add your comment..."
            className="w-full p-2 active:border-0 focus:border-0 outline-0 rounded-lg mb-4 bg-slate-700"
            rows="4"
          ></textarea>
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
