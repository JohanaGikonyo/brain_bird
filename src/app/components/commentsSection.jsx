import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useUser } from "../store/useStore";
import CustomAvatar from "./CustomAvatar";
import CommentContent from "./CommentContent";
const CommentSection = ({ postId, comments = [], handleAddComment, showComments }) => {
  const [newComment, setNewComment] = useState("");
  const { user } = useUser();

  const submitComment = () => {
    if (newComment.trim()) {
      const commentData = {
        text: newComment,
        commenterEmail: user.email,
      };
      handleAddComment(postId, commentData); // Pass the comment object
      setNewComment(""); // Clear the input
    }
  };

  

  return (
    <div className="mt-2">
      {showComments && (
        <div className="mt-2">
          {comments && comments.length > 0 ? (
            comments.map((comment, index) => {
              // Parse the comment if it's stored as a JSON string
              const parsedComment = typeof comment === "string" ? JSON.parse(comment) : comment;

              return (
                <div key={index} className="flex items-start gap-2 mt-1 text-white">
                  <div>
                    <div className="text-gray-400 text-sm">{<CustomAvatar email={parsedComment.commenterEmail} size = {"0.5rem"}/>}</div>
                    <div className="mt-1 ml-4 text-slate-200 text-sm"><CommentContent comment={parsedComment.text}/></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-400">No comments yet</div>
          )}
        </div>
      )}

      {/* Comment input section */}
      <div className="mt-2 flex items-start rounded-2xl lg:w-1/2 w-full justify-center bg-slate-950">
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
