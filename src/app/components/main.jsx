import React, { useState, useEffect } from "react";
// import { useInView } from "react-intersection-observer";
import { useSelected } from "../store/useSection";
import UserPost from "../components/UserPost";
import { supabase } from "../lib/supabaseClient";
import Profile from "./Profile";
import { useUser, useSearch } from "../store/useStore";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import CustomProfile from "./CustomProfile";
import SkeletonChildren from "./Skeleton";
import MyPosts from "./MyPosts";
import RepostButton from "./RepostButton";
import Groups from "./Groups";
import { useShowTop, useShowFollowersPosts } from "../store/useStore";
import Post from './Post'
function Main() {
  const { selectedItem} = useSelected();
  const { user } = useUser();
  const { showTop } = useShowTop();
  const { showFollowersPosts } = useShowFollowersPosts();
  const { search } = useSearch();
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [postEmail, setPostEmail] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFollowing, setIsFollowing] = useState([]);
  // const { ref, inView } = useInView({ threshold: 0.1 });
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsResult, repostsResult] = await Promise.all([
          supabase.from("posts")
            .select("id, post, created_at, email, comments, reposts, views, media, original_post_id, reposter_email")
            .order("created_at", { ascending: false })
            .range(page * 3, (page + 1) * 3 - 1),
          supabase.from("reposts")
            .select("post_id, repost_id, reposter_email, comment, created_at")
            .order("created_at", { ascending: false })
            .range(page * 3, (page + 1) * 3 - 1)
        ]);
  
        if (postsResult.error) throw postsResult.error;
        if (repostsResult.error) throw repostsResult.error;
  
        // Check if both results have data
        if (postsResult.data.length === 0 && repostsResult.data.length === 0) {
          setHasMore(false); // Stop further fetching if both are empty
        } else {
          // Update posts and reposts state
          setPosts((prevPosts) => [...prevPosts, ...postsResult.data]);
          setReposts((prevRePosts) => [...prevRePosts, ...repostsResult.data]);
        }
  
      } catch (error) {
        console.error("Error fetching data:", error);
        // Optionally set an error state here to inform users
      } finally {
        setLoading(false);
      }
    };
  
    // Only fetch data if there are more items
    if ( hasMore) {
      fetchData();
    }
  }, [page, user.email, hasMore]); // Ensure dependencies are correct
  
  
  
  
  useEffect(() => {
   
  
    const checkIfFollowing = async () => {
      try {
        const { data: currentUserData, error: currentUserError } = await supabase
          .from("users")
          .select("connections")
          .eq("email", user.email)
          .single();
        if (currentUserError) {
          console.error("Error fetching current user connections:", currentUserError);
          return;
        }
        if (currentUserData && currentUserData.connections) {
          setIsFollowing(currentUserData.connections);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };
    checkIfFollowing();
  }, [ user.email]);

  useEffect(() => {
    if ( hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [ hasMore]);
  

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

  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reposts" }, (payload) => {
        setPosts((prevPosts) => [payload.new, ...prevPosts]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reposts" }, (payload) => {
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === payload.new.id ? { ...post, ...payload.new } : post))
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "reposts" }, (payload) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const handleRepost =  (postId,  postEmail) => {
    setSelectedPost({ id: postId, email: postEmail });
    console.log("reposting");
   
    
  };

  const getReposts =  (postId) => {
    const repostsArrayWithPostId=reposts.filter((repost)=>repost.post_id === postId)
    return repostsArrayWithPostId.length;
    
  };
 
  const handleRepostSuccess = () => {
    setSelectedPost(null);
    // Optionally refetch posts or update the post list
  };

  

  const handleView = async (selectedPost) => {
    const emailToView = selectedPost.original_post_id ? selectedPost.reposter_email : selectedPost.email;

    // Update the email state for the post viewer
    const updateEmailState = (email) => {
      return new Promise((resolve) => {
        setPostEmail(email);
        resolve(email);
      });
    };

    await updateEmailState(emailToView);

    setViewingPost(selectedPost);

    // Update views count for the specific post (original or repost)
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
      <div>
        <SkeletonChildren />
      </div>
    );
  }
 

  const filteredSearch = (posts.filter((post) => {
    const matchesSearch =
      (post.email?.toLowerCase().includes(search.toLowerCase()) ||
      (post.post?.toLowerCase().includes(search.toLowerCase()) 
    ) )
     
    const isFollowed = isFollowing.includes(post.email);
    
    if (showFollowersPosts) {
      return matchesSearch && isFollowed;
    } else {
      return matchesSearch;
    }
  })  || reposts.filter((repost) => {
    const matchesSearch =
      (repost.reposter_email?.toLowerCase().includes(search.toLowerCase()) ||
      (repost.comment?.toLowerCase().includes(search.toLowerCase()) 
    ) )
     
    
      return matchesSearch;
    
  }));
  return (
    <div className="flex flex-col items-center flex-1 lg:border border-slate-800 lg:border-y-0 text-slate-100 shadow-lg lg:p-4 p-1">
      {(selectedItem === "" ||
        selectedItem === "!Groups" ||
        selectedItem === "Messages" ||
        selectedItem === "!Messages") && (
        <div className={`flex flex-col  ${showTop ? `mt-0` : `mt-28`} lg:mt-6 w-full`}>
          <UserPost />
          <div
            className={`${
              selectedItem === "!Messages" ? `grid lg:grid-cols-1 xl:grid-cols-2 gap-4 mt-2 ` : `flex flex-col gap-4 `
            }`}
          >
            {filteredSearch.length === 0 ? (
              <div className="text-2xl font-extrabold flex items-center justify-center mt-10">
                <Box sx={{ display: "flex" }} className="flex gap-5">
                  <CircularProgress size={24} />
                </Box>
              </div>
            ) : (
              
                  <Post
                    reposts={reposts}
                    getReposts={getReposts}
                    toggleCommentsVisibility={toggleCommentsVisibility}
                    handleRepost={handleRepost}
                    handleView={handleView}
                    commentsVisible={commentsVisible}
                    handleAddComment={handleAddComment}
                    posts={filteredSearch}
                    setPosts={setPosts}
                  />
              
              
            )}
          </div>
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
      {/* {selectedItem === "Stocks" && <h1>Stocks Selected</h1>} */}
      {selectedItem === "profile" && <Profile />}
      {/* {selectedItem === "Weather" && <h1>Weather Selected</h1>} */}
      {selectedItem === "Groups" && <Groups />}
      {/* {selectedItem === "Sports" && <h1>Sports Selected</h1>} */}
      {selectedItem === "my posts" && <MyPosts />}
      {/* RepostButton Modal */}{" "}
      {selectedPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <RepostButton
            postId={selectedPost.id}
            postEmail={selectedPost.email}
            onSuccess={handleRepostSuccess}
            post={posts}
            setSelectedPost={setSelectedPost}
          />
        </div>
      )}
    </div>
  );
}

export default Main;
