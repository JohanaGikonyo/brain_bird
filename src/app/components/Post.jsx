import React from "react";
import { useUser } from "../store/useStore";
import CustomAvatar from "./CustomAvatar";
import PostContent from "./PostContent";
import PostMedia from "./PostMedia";
import LikeButton from "./LikeButton";
import MessageIcon from "@mui/icons-material/Message";
import RepeatIcon from "@mui/icons-material/Repeat";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Follow from "./Follow";
import CommentSection from "./commentsSection";

const Post = ({
  post,
  reposts = [],
  getReposts,
  toggleCommentsVisibility,
  handleRepost,
  handleView,
  commentsVisible,
  handleAddComment,
  posts,
  setPosts,
}) => {
  const { user } = useUser();

  const formatTimeAgo = (date) => {
    const diff = Math.abs(new Date() - new Date(date));
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}mo`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <>
      {reposts.length === 0 ? (
        // Display Original Post
        <div className="mt-6 bg-gray-800 border border-gray-700 rounded-md p-4">
          {/* Original Post Header */}
          <div className="flex items-start gap-4">
            <CustomAvatar email={post.email} />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">{formatTimeAgo(post.created_at)}</p>
                </div>
                <Follow email={post.email} currentUserEmail={user.email} />
              </div>
            </div>
          </div>

          {/* Original Post Content */}
          <div className="mt-4">
            <PostContent content={post.post} />
            {post.media && (
              <div className="mt-3">
                <PostMedia mediaUrls={post.media} />
              </div>
            )}
          </div>

          {/* Footer Section for Original Post */}
          <div className="flex items-center justify-between text-gray-400 text-sm mt-4  border-gray-600 pt-3">
            <button
              onClick={() => toggleCommentsVisibility(post.id)}
              className="flex items-center gap-1 hover:text-blue-400"
            >
              <MessageIcon fontSize="small" />
              <span>{Array.isArray(post.comments) ? post.comments.length : 0} Comments</span>
            </button>
            <button onClick={() => handleRepost(post.id)} className="flex items-center gap-1 hover:text-blue-400">
              <RepeatIcon fontSize="small" />
              <span>{getReposts(post.id)} Reposts</span>
            </button>
            <LikeButton post={post} posts={posts} setPosts={setPosts} />
            <button onClick={() => handleView(post)} className="flex items-center gap-1 hover:text-blue-400">
              <VisibilityIcon fontSize="small" />
              <span>{post.views} Views</span>
            </button>
          </div>

          {/* Comments Section for Original Post */}
          <CommentSection
            postId={post.id}
            comments={Array.isArray(post.comments) ? post.comments : []}
            showComments={commentsVisible === post.id}
            handleAddComment={handleAddComment}
          />
        </div>
      ) : (
        // Display Reposts
        <>
          {reposts.map((repost) => (
            <div key={repost.repost_id} className="mt-6 bg-slate-950 border border-gray-700 rounded-md p-4">
              {/* Repost Header */}
              <div className="flex items-start gap-4 mb-2 flex-wrap">
                <CustomAvatar email={repost.reposter_email} />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                  <p className="text-xs text-gray-400">{formatTimeAgo(repost.created_at)}</p>
                  <Follow email={repost.reposter_email} currentUserEmail={user.email} />
                </div>
              </div>

              {/* Displaying repost comment or additional details */}
              {repost.comment && (
                <>
                  <PostContent content={repost.comment} />
                  {repost.media && (
                    <div className="mt-2">
                      <PostMedia mediaUrls={repost.media} />
                    </div>
                  )}
                </>
              )}

              {/* Original Post Section within the Repost */}
              <div className="mt-4  pt-3 bg-gray-900 p-3 rounded-md">
                {/* Original Post Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CustomAvatar email={post.email} />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                    <p className="text-xs text-gray-400">{formatTimeAgo(post.created_at)}</p>
                    <Follow email={post.email} currentUserEmail={user.email} />
                  </div>
                </div>

                {/* Original Post Content */}
                <PostContent content={post.post} />
                {post.media && (
                  <div className="mt-3">
                    <PostMedia mediaUrls={post.media} />
                  </div>
                )}

                {/* Footer Section for Original Post */}
                <div className="flex items-center justify-between text-gray-400 text-sm mt-4  border-gray-600 pt-3">
                  <button
                    onClick={() => toggleCommentsVisibility(post.id)}
                    className="flex items-center gap-1 hover:text-blue-400"
                  >
                    <MessageIcon fontSize="small" />
                    <span>{Array.isArray(post.comments) ? post.comments.length : 0} Comments</span>
                  </button>
                  <button onClick={() => handleRepost(post.id)} className="flex items-center gap-1 hover:text-blue-400">
                    <RepeatIcon fontSize="small" />
                    <span>{getReposts(post.id)} Reposts</span>
                  </button>
                  <LikeButton post={post} posts={posts} setPosts={setPosts} />
                  <button onClick={() => handleView(post)} className="flex items-center gap-1 hover:text-blue-400">
                    <VisibilityIcon fontSize="small" />
                    <span>{post.views} Views</span>
                  </button>
                </div>

                {/* Comments Section for Original Post */}
                <CommentSection
                  postId={post.id}
                  comments={Array.isArray(post.comments) ? post.comments : []}
                  showComments={commentsVisible === post.id}
                  handleAddComment={handleAddComment}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default Post;
