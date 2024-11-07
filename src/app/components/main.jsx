import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useSelected } from "../store/useSection";
import UserPost from "../components/UserPost";
import { supabase } from "../lib/supabaseClient";
import CommentSection from "./commentsSection";
import MessageIcon from "@mui/icons-material/Message";
import RepeatIcon from "@mui/icons-material/Repeat";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CustomAvatar from "./CustomAvatar";
import LikeButton from "./LikeButton";
import Profile from "./Profile";
import Follow from "./Follow"; // Updated for user follow
import { useUser } from "../store/useStore";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import PostMedia from "./PostMedia";
import CustomProfile from "./CustomProfile";
function Main() {
  const { selectedItem } = useSelected();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [postEmail, setPostEmail] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView({ threshold: 0.1 });
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, post, created_at, email, comments, reposts, views, follower_count, media")
        .order("created_at", { ascending: false })
        .range(page * 10, (page + 1) * 10 - 1);
      if (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
        return;
      }
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }
      setLoading(false);
    };
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        setPosts((prevPosts) => [payload.new, ...prevPosts]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (payload) => {
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === payload.new.id ? { ...post, ...payload.new } : post))
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" }, (payload) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const processContent = (content) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const hashtagRegex = /#(\w+)/g;
    return content
      .replace(urlRegex, (url) => `<a href="${url}" class="text-blue-500" target="_blank">${url}</a>`)
      .replace(hashtagRegex, (hashtag) => `<span class="text-blue-500">${hashtag}</span>`);
  };
  const PostContent = ({ content }) => {
    const processedContent = processContent(content);
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} className="break-words text-white mt-2" />;
  };

  const handleAddComment = async (postId, comment) => {
    const { data: post, error: fetchError } = await supabase.from("posts").select("*").eq("id", postId).single();

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
    // Function to update state and return a promise
    const updateEmailState = (email) => {
      return new Promise((resolve) => {
        setPostEmail(email);
        resolve(email);
      });
    };

    await updateEmailState(selectedPost.email);

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
          <CircularProgress size={24} />
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
    <div className="flex flex-col items-center flex-1 lg:border border-slate-800 lg:border-y-0 text-slate-100 shadow-lg lg:p-4 p-1">
      {selectedItem === "" && (
        <div className="flex flex-col gap-4 lg:mt-6 mt-28 w-full">
          <UserPost />
          {posts.length === 0 ? (
            <div className="text-2xl font-extrabold flex items-center justify-center mt-10">
              <Box sx={{ display: "flex" }} className="flex gap-5">
                <CircularProgress size={24} />
                <p>Please wait ...</p>
              </Box>
            </div>
          ) : (
            posts.map((post, index) => (
              <div
                key={index}
                className="border-b border-slate-900 w-full py-4 px-1 lg:px-4 hover:cursor-pointer rounded-lg bg-slate-900 overflow-hidden"
              >
                <div className="flex items-start gap-3 sm:gap-4 ">
                  <div className="flex-1">
                    <div className="p-3 sm:p-4 rounded-lg text-gray-400 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <span className="font-bold flex gap-2 items-center" onClick={() => handleView(post)}>
                        <CustomAvatar email={post.email} avatarUrl={post.avatar_url} />
                      </span>

                      <Follow
                        email={post.email}
                        currentUserEmail={user.email}
                        postedDate={` ${formatTimeAgo(post.created_at)}`}
                      />
                    </div>
                    <div className="text-lg text-white mt-2 break-words">
                      <PostContent content={post.post} />
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
          <div ref={ref} className="observer" />
        </div>
      )}

      {viewingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md md:max-w-lg mx-4 md:mx-0 p-6 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500 transition duration-200 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Profile Content */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex flex-col items-center space-y-6">
                {/* Profile Picture and Info */}
                <div className="flex flex-col items-center space-y-3">
                  <CustomProfile email={postEmail} />
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-300">{postEmail}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                    Detailed information about the user can be viewed here.
                  </p>
                </div>

                {/* Additional User Details */}
                <div className="w-full space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="font-semibold text-base">Location:</h3>
                    <p className="text-sm">City, Country</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">About:</h3>
                    <p className="text-sm">
                      Brief description or bio of the user here, providing insight into their profile.
                    </p>
                  </div>
                  {/* Add more sections as needed */}
                </div>
              </div>
            </div>

            {/* Footer with Action Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
              >
                Close
              </button>
            </div>
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
