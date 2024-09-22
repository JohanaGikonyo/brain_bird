import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSelected } from "../store/useSection";
import UserPost from "../components/UserPost";
import { supabase } from "../lib/supabaseClient";
import UserAvatar from "../components/UserAvatar";
import CommentSection from "./commentsSection";
import MessageIcon from "@mui/icons-material/Message";
import RepeatIcon from "@mui/icons-material/Repeat";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LikeButton from "./LikeButton";
import Profile from "./Profile";
import Follow from "./Follow";
import { useUser } from "../store/useStore";
function Main() {
  const { selectedItem } = useSelected();
  const {} = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false); // To toggle comments

  const [viewingPost, setViewingPost] = useState(null); // State to hold the post being viewed

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, post, created_at, email, comments, reposts, views")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    const interval = setInterval(fetchPosts, 1000); // Fetch every 1 second
    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  const getUsernameFromEmail = (email) => {
    if (!email) {
      // Handle the case where email is null or undefined
      return "@user"; // or return null, or any default username you prefer
    }
    const username = email.split("@")[0];
    const cleanedUsername = username.replace(/\d+/g, "");
    return "@" + cleanedUsername;
  };

  const handleAddComment = async (postId, comment) => {
    const { data: post } = await supabase.from("posts").select("comments").eq("id", postId).single();

    const updatedComments = [...(post.comments || []), comment];

    const { error } = await supabase.from("posts").update({ comments: updatedComments }).eq("id", postId);

    if (error) {
      console.error("Error adding comment:", error);
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
    // Show the modal with the selected post data
    setViewingPost(selectedPost);

    // Update the views count in Supabase
    const { error } = await supabase
      .from("posts")
      .update({ views: selectedPost.views + 1 })
      .eq("id", selectedPost.id);

    if (error) {
      console.error("Error updating views:", error);
    } else {
      // Optimistically update the state
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === selectedPost.id ? { ...post, views: selectedPost.views + 1 } : post))
      );
    }
  };

  const closeModal = () => {
    setViewingPost(null);
  };

  return (
    <div className="flex flex-col items-center flex-1 lg:border border-slate-800 lg:border-y-0 text-slate-100 shadow-lg p-4">
      {selectedItem == "" && (
        <div className="flex flex-col gap-4 mt-4 w-full">
          <div>
            <UserPost />
          </div>
          {posts.length === 0 ? (
            <p>No posts yet. Be the first to post!</p>
          ) : (
            posts.map((post, index) => (
              <div key={index} className="border-b border-slate-900 w-full py-4 hover:cursor-pointer">
                <div className="flex items-start gap-4 ml-3">
                  <div className="flex-1">
                    <div className="p-4 rounded-lg text-gray-400 w-full flex justify-between items-center">
                      <span className="font-bold flex gap-1 items-center">
                        <UserAvatar email={post.email} />
                        {getUsernameFromEmail(post.email)}
                      </span>
                      <Follow post={post} />
                    </div>

                    <div className="text-lg text-white mt-2">
                      {typeof post.post === "string" ? post.post : JSON.stringify(post.post)}
                    </div>

                    <div className="text-gray-400 text-sm mt-2">
                      {`Posted ${formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}`}
                    </div>

                    <div className="flex items-center justify-around text-gray-400 mt-2">
                      <div className="flex items-center space-x-1">
                        <button onClick={() => setShowComments(!showComments)}>
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
                      showComments={showComments}
                      setShowComments={setShowComments}
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
          <div className="bg-white p-6 rounded-lg w-96 text-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserAvatar email={viewingPost.email} />
                <span className="ml-2 font-bold">{getUsernameFromEmail(viewingPost.email)}</span>
              </div>
              <button onClick={closeModal} className="text-red-500 text-lg">
                &times;
              </button>
            </div>
            <div className="mt-4">
              <p>{viewingPost.post}</p>
            </div>
          </div>
        </div>
      )}

      {selectedItem == "Stocks" && <h1>Stocks Selected</h1>}
      {selectedItem == "profile" && <Profile />}
      {selectedItem == "Weather" && <h1>Weather Selected</h1>}
      {selectedItem == "Groups" && <h1>Groups Selected</h1>}
      {selectedItem == "Sports" && <h1>Sports Selected</h1>}
      {selectedItem == "Account" && <h1>Account Selected</h1>}
    </div>
  );
}

export default Main;
