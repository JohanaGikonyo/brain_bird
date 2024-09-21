import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useUser } from "../store/useStore";

const CommentSection = ({ postId, comments = [], handleAddComment, showComments }) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useUser();

  const submitComment = () => {
    if (newComment.trim()) {
      handleAddComment(postId, newComment); // Call the passed function
      setNewComment(""); // Clear the input
    }
  };

  const getUsernameFromEmail = (email) => {
    const username = email.split("@")[0];
    const cleanedUsername = username.replace(/\d+/g, "");
    return "@" + cleanedUsername;
  };

  return (
    <div className="mt-2">
      {showComments && (
        <div className="mt-2">
          {comments && comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="flex items-start gap-2 mt-1 text-white">
                {/* Display user avatar and username */}
                {/* <UserAvatar email={user.email} /> */}

                <div>
                  <div className="text-gray-400 text-sm">{getUsernameFromEmail(user.email)}</div>
                  <div className="mt-1 ml-4">{comment}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">No comments yet</div>
          )}
        </div>
      )}

      {/* Comment input section */}
      <div className="mt-2 flex items-start rounded-2xl lg:w-1/2 w-full justify-center bg-slate-900">
        <textarea
          className="p-2 text-gray-400 bg-transparent focus:outline-none rounded resize-none overflow-hidden w-full"
          rows={1}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          onInput={(e) => {
            e.target.style.height = "auto"; // Reset height
            e.target.style.height = `${e.target.scrollHeight}px`; // Set new height based on scroll height
          }}
        />
        <button onClick={submitComment} className="px-4 py-1 rounded ml-2 text-gray-400">
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
