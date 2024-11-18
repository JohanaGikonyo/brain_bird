import React from "react";
import { useUser } from '../store/useStore';
import CustomAvatar from './CustomAvatar';
import PostContent from './PostContent';
import PostMedia from './PostMedia';
import LikeButton from './LikeButton';
import MessageIcon from '@mui/icons-material/Message';
import RepeatIcon from '@mui/icons-material/Repeat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Follow from './Follow';
import CommentSection from './commentsSection';

const Post = ({ post, repost, toggleCommentsVisibility, handleRepost, handleView, commentsVisible, handleAddComment, posts, setPosts }) => {
  const { user } = useUser();
console.log(repost)
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
    <div className="border-b border-gray-700 w-full py-4 px-3 lg:px-6 hover:cursor-pointer rounded-lg bg-slate-800">
      {/* Post Container */}
      <div className="flex flex-col space-y-4">
        {/* Header Section */}
        <div className="flex items-center gap-3">
          {/* Reposter Avatar */}
          <CustomAvatar
            email={repost ? repost.reposter_email : post.email}
          />

          {/* Reposter Details */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
            <p className="text-sm text-gray-400">
              {repost ? "Reposted" : "Posted"} {formatTimeAgo(repost ? repost.created_at : post.created_at)}
            </p>

            {/* Follow Button */}
            <div className="mt-2 sm:mt-0">
              <Follow
                email={repost ? repost.reposter_email : post.email}
                currentUserEmail={user.email}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-12">
          {repost && (
            <div className="bg-gray-700 border border-gray-600 rounded-md p-4 mb-3">
              {/* Original Post Details */}
              <div className="flex items-center gap-2 mb-2">
                <CustomAvatar email={post.email} />
              </div>
              <p className="text-gray-400">{post.post}</p>

              {/* Original Post Media */}
              {post.media && (
                <div className="w-full max-w-full mt-3 overflow-hidden rounded-lg">
                  <PostMedia mediaUrls={post.media} />
                </div>
              )}
            </div>
          )}

          {/* Reposter's Content */}
          <PostContent content={repost ? repost.comment : post.post} />

          {/* Reposter's Media */}
          {repost ? null : post.media && (
            <div className="w-full max-w-full mt-3 overflow-hidden rounded-lg">
              <PostMedia mediaUrls={post.media} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-3 text-gray-400 mt-4 px-3">
          <button
            onClick={() => toggleCommentsVisibility(post.id)}
            className="flex items-center gap-1"
          >
            <MessageIcon />
            <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
          </button>
          <button
            onClick={() => handleRepost(post.id)}
            className="flex items-center gap-1"
          >
            <RepeatIcon />
            <span>{post.reposts}</span>
          </button>
          <LikeButton post={post} posts={posts} setPosts={setPosts} />
          <button onClick={() => handleView(post)} className="flex items-center gap-1">
            <VisibilityIcon />
            <span>{post.views}</span>
          </button>
        </div>

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          comments={Array.isArray(post.comments) ? post.comments : []}
          showComments={commentsVisible === post.id}
          handleAddComment={handleAddComment}
        />
      </div>
    </div>
  );
};

export default Post;
