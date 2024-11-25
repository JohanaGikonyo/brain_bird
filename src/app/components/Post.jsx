import React, { memo } from "react";
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
import { useShowFollowersPosts } from "../store/useStore";
import { useTopStories } from "../store/useStore";
// eslint-disable-next-line react/display-name
const Post = memo(
  ({
    isFollowing,
    search,
    reposts,
    getReposts,
    toggleCommentsVisibility,
    handleRepost,
    handleView,
    commentsVisible,
    handleAddComment,
    posts, // The posts array, which contains the original posts
    setPosts,
    handleViewPost,
  }) => {
    const { user } = useUser();
    const { showFollowersPosts } = useShowFollowersPosts();
    const { topStories } = useTopStories();
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const combinedPosts = [
      ...posts.map((p) => ({ type: "post", data: p })),
      ...reposts.map((r) => ({ type: "repost", data: r })),
    ];

    // Sort by likes and date if topStories is true
    if (topStories) {
      combinedPosts.sort((a, b) => 
         b.data.likes - a.data.likes 
         
     );
      
    } else {
      combinedPosts.sort((a, b) => new Date(b.data.created_at) - new Date(a.data.created_at));
    }

    const filteredSearch = combinedPosts.filter((post) => {
      const matchesSearch =
        post.data.email?.toLowerCase().includes(search.toLowerCase()) ||
        post.data.post?.toLowerCase().includes(search.toLowerCase()) ||
        post.data.comment?.toLowerCase().includes(search.toLowerCase()) ||
        post.data.reposter_email?.toLowerCase().includes(search.toLowerCase());

      const isFollowed = isFollowing.includes(post.data.email) || isFollowing.includes(post.data.reposter_email);

      if (showFollowersPosts) {
        return matchesSearch && isFollowed;
      } else {
        return matchesSearch;
      }
    });

    return (
      <>
        {filteredSearch.map((item) => {
          if (item.type === "post") {
            const post = item.data;
            return (
              <div key={post.id} className="mt-6 bg-gray-800 border border-gray-700 rounded-md p-4">
                {/* Original Post Header */}
                <div className="flex items-start gap-4 hover:cursor-pointer">
                  <div onClick={() => handleView(post)}>
                    {" "}
                    <CustomAvatar email={post.email} />
                  </div>
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
                <div className="flex items-center justify-between text-gray-400 text-sm mt-4 border-gray-600 pt-3">
                  <button
                    onClick={() => toggleCommentsVisibility(post.id)}
                    className="flex items-center gap-1 hover:text-blue-400"
                  >
                    <MessageIcon fontSize="small" />
                    <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                  </button>
                  <button onClick={() => handleRepost(post.id)} className="flex items-center gap-1 hover:text-blue-400">
                    <RepeatIcon fontSize="small" />
                    <span>{getReposts(post.id)}</span>
                  </button>
                  <LikeButton post={post} posts={posts} setPosts={setPosts} />
                  <button onClick={() => handleViewPost(post)} className="flex items-center gap-1 hover:text-blue-400">
                    <VisibilityIcon fontSize="small" />
                    <span>{post.views}</span>
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
            );
          } else if (item.type === "repost") {
            const repost = item.data;
            // Find the original post using repost.post_id
            const originalPost = posts.find((p) => p.id === repost.post_id);

            return (
              <div key={repost.repost_id} className="mt-6 bg-slate-950 border border-gray-700 rounded-md p-4">
                {/* Repost Header */}
                <div className="flex items-start gap-4 mb-2 flex-wrap hover:cursor-pointer">
                  <div onClick={() => handleView(repost)} className="hover:cursor-pointer">
                    <CustomAvatar email={repost.reposter_email} />
                  </div>
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
                {originalPost && (
                  <div className="mt-4 pt-3 bg-gray-900 p-3 rounded-md">
                    {/* Original Post Header */}
                    <div className="flex items-center justify-between gap-4 flex-wrap hover:cursor-pointer">
                      <div onClick={() => handleView(originalPost)}>
                        <CustomAvatar email={originalPost.email} />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                        <p className="text-xs text-gray-400">{formatTimeAgo(originalPost.created_at)}</p>
                        <Follow email={originalPost.email} currentUserEmail={user.email} />
                      </div>
                    </div>

                    {/* Original Post Content */}
                    <PostContent content={originalPost.post} />
                    {originalPost.media && (
                      <div className="mt-3">
                        <PostMedia mediaUrls={originalPost.media} />
                      </div>
                    )}

                    {/* Footer Section for Original Post */}
                    <div className="flex items-center justify-between text-gray-400 text-sm mt-4 border-gray-600 pt-3">
                      <button
                        onClick={() => toggleCommentsVisibility(originalPost.id)}
                        className="flex items-center gap-1 hover:text-blue-400"
                      >
                        <MessageIcon fontSize="small" />
                        <span>{Array.isArray(originalPost.comments) ? originalPost.comments.length : 0}</span>
                      </button>
                      <button
                        onClick={() => handleRepost(originalPost.id)}
                        className="flex items-center gap-1 hover:text-blue-400"
                      >
                        <RepeatIcon fontSize="small" />
                        <span>{getReposts(originalPost.id)}</span>
                      </button>
                      <LikeButton post={originalPost} posts={posts} setPosts={setPosts} />
                      <button
                        onClick={() => handleViewPost(originalPost)}
                        className="flex items-center gap-1 hover:text-blue-400"
                      >
                        <VisibilityIcon fontSize="small" />
                        <span>{originalPost.views}</span>
                      </button>
                    </div>

                    {/* Comments Section for Original Post */}
                    <CommentSection
                      postId={originalPost.id}
                      comments={Array.isArray(originalPost.comments) ? originalPost.comments : []}
                      showComments={commentsVisible === originalPost.id}
                      handleAddComment={handleAddComment}
                    />
                  </div>
                )}
              </div>
            );
          }
        })}
      </>
    );
  }
);

export default Post;
