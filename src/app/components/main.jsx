import React, { useState, useEffect } from "react";
// import { formatDistanceToNow } from "date-fns";
import { useSelected } from "../store/useSection";
import UserPost from "../components/UserPost";
import { supabase } from "../lib/supabaseClient";
import UserAvatar from "../components/UserAvatar";
import CommentSection from "./commentsSection";
import MessageIcon from "@mui/icons-material/Message";
import RepeatIcon from "@mui/icons-material/Repeat";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CustomeAvatar from "./CustomAvatar";
import LikeButton from "./LikeButton";
import Profile from "./Profile";
import Follow from "./Follow"; // Updated for user follow
import { useUser } from "../store/useStore";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import PostMedia from "./PostMedia";

function Main() {
  const { selectedItem } = useSelected();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [following, setFollowing] = useState({});
  const [followersNumber, setFollowersNumber] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, post, created_at, email, comments, reposts, views, follower_count, media")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    const interval = setInterval(fetchPosts, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (!user.email) return;
      const { data, error } = await supabase.from("follow").select("followed_email").eq("follower_email", user.email);

      if (error) {
        console.error("Error fetching following status:", error);
      } else {
        const followingMap = {};
        data.forEach((follow) => {
          followingMap[follow.followed_email] = true;
        });
        setFollowing(followingMap);
      }
    };

    fetchFollowingStatus();
  }, [user.email]);

  const getUsernameFromEmail = (email) => {
    if (!email) {
      return "@user";
    }
    const username = email.split("@")[0];
    const cleanedUsername = username.replace(/\d+/g, "");
    return "@" + cleanedUsername;
  };

  const handleAddComment = async (postId, comment) => {
    const { data: post, error: fetchError } = await supabase.from("posts").select("comments").eq("id", postId).single();

    if (fetchError) {
      console.error("Error fetching post comments:", fetchError);
      return;
    }

    const existingComments = post.comments?.map((c) => (typeof c === "string" ? JSON.parse(c) : c)) || [];
    const updatedComments = [...existingComments, comment];

    const { error: updateError } = await supabase.from("posts").update({ comments: updatedComments }).eq("id", postId);

    if (updateError) {
      console.error("Error adding comment:", updateError);
    }
  };

  const handleRepost = async (postId, currentReposts) => {
    const { error } = await supabase
      .from("posts")
      .update({ reposts: currentReposts + 1 })
      .eq("id", postId);

    if (error) {
      console.error("Error updating reposts:", error);
    } else {
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? { ...post, reposts: currentReposts + 1 } : post))
      );
    }
  };

  const handleView = async (selectedPost) => {
    setViewingPost(selectedPost);

    const { error } = await supabase
      .from("posts")
      .update({ views: selectedPost.views + 1 })
      .eq("id", selectedPost.id);

    if (error) {
      console.error("Error updating views:", error);
    } else {
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === selectedPost.id ? { ...post, views: selectedPost.views + 1 } : post))
      );
    }
  };

  const toggleCommentsVisibility = (postId) => {
    setCommentsVisible((prev) => (prev === postId ? null : postId));
  };

  const closeModal = () => {
    setViewingPost(null);
  };

  if (loading) {
    return (
      <div className="text-2xl font-extrabold flex items-center justify-center mt-60">
        <Box sx={{ display: "flex" }} className="flex gap-5">
          <CircularProgress />
          <p>Please wait ...</p>
        </Box>
      </div>
    );
  }
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
    <div className="flex flex-col items-center flex-1 lg:border border-slate-800 lg:border-y-0 text-slate-100 shadow-lg p-4">
      {selectedItem === "" && (
        <div className="flex flex-col gap-4 lg:mt-4 mt-16 w-full">
          <UserPost />
          {posts.length === 0 ? (
            <div className="text-2xl font-extrabold flex items-center justify-center mt-10">
              <Box sx={{ display: "flex" }} className="flex gap-5">
                <CircularProgress />
                <p>Please wait ...</p>
              </Box>
            </div>
          ) : (
            posts.map((post, index) => (
              <div
                key={index}
                className="border-b border-slate-900 w-full py-4 px-4 sm:px-5 hover:cursor-pointer rounded-lg bg-slate-900 overflow-hidden"
              >
                <div className="flex items-start gap-3 sm:gap-4 ml-2 sm:ml-3">
                  <div className="flex-1">
                    <div className="p-3 sm:p-4 rounded-lg text-gray-400 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <span className="font-bold flex gap-2 items-center" onClick={() => handleView(post)}>
                        <CustomeAvatar email={post.email} avatarUrl={post.avatar_url} />
                        <span className="truncate">{getUsernameFromEmail(post.email)}</span>
                      </span>
                      {following[post.email] ? (
                        <span className="text-green-500 mt-2 sm:mt-0">You are following</span>
                      ) : (
                        <Follow
                          email={post.email}
                          currentUserEmail={user.email}
                          setFollowersNumber={setFollowersNumber}
                          postedDate={` ${formatTimeAgo(post.created_at)}`}
                        />
                      )}
                    </div>
                    <div className="text-lg text-white mt-2 break-words">
                      {typeof post.post === "string" ? post.post : JSON.stringify(post.post)}
                      {post.media && (
                        <div className="w-full max-w-full mt-2 overflow-hidden rounded-lg">
                          <PostMedia mediaUrls={post.media} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-around text-gray-400 mt-2">
                      <div className="flex items-center space-x-1">
                        <button onClick={() => toggleCommentsVisibility(post.id)}>
                          <MessageIcon titleAccess="message" />
                        </button>
                        <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                      </div>
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => handleRepost(post.id, post.reposts)}
                      >
                        <RepeatIcon titleAccess="repost" />
                        <span>{post.reposts}</span>
                      </button>
                      <LikeButton post={post} posts={posts} setPosts={setPosts} />
                      <button className="flex items-center space-x-1" onClick={() => handleView(post)}>
                        <VisibilityIcon titleAccess="view" />
                        <span>{post.views}</span>
                      </button>
                    </div>
                    <CommentSection
                      postId={post.id}
                      comments={Array.isArray(post.comments) ? post.comments : []}
                      showComments={commentsVisible === post.id}
                      handleAddComment={handleAddComment}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {viewingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg w-96 text-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserAvatar email={viewingPost.email} />
              </div>
              <button onClick={closeModal} className="text-red-500 text-lg">
                &times;
              </button>
            </div>
            <div className="mt-4 text-slate-100">{viewingPost.post}</div>
            <div className="mt-4 text-slate-100">{followersNumber} Followers</div>
          </div>
        </div>
      )}
      {selectedItem === "Stocks" && <h1>Stocks Selected</h1>}
      {selectedItem === "profile" && <Profile />}
      {selectedItem === "Weather" && <h1>Weather Selected</h1>}
      {selectedItem === "Groups" && <h1>Groups Selected</h1>}
      {selectedItem === "Sports" && <h1>Sports Selected</h1>}
      {selectedItem === "Account" && <h1>Account </h1>}
    </div>
  );
}

export default Main;
