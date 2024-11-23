import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useSelected } from "../store/useSection";
import UserPost from "../components/UserPost";
import { supabase } from "../lib/supabaseClient";
import Profile from "./Profile";
import { useUser, useSearch } from "../store/useStore";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import SkeletonChildren from "./Skeleton";
import MyPosts from "./MyPosts";
import RepostButton from "./RepostButton";
import Groups from "./Groups";
import { useShowTop } from "../store/useStore";
import Post from "./Post";
import CustomModal from './CustomModal'
function Main() {
  const { selectedItem } = useSelected();
  const { user } = useUser();
  const { showTop } = useShowTop();
  const { search } = useSearch();
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [postEmail, setPostEmail] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [page, setPage] = useState(0);
  const [repostPage, setRepostPage] = useState(0);

  const [hasMore, setHasMore] = useState(true);
  const [hasMoreReposts, setHasMoreReposts] = useState(true);

  const [isFollowing, setIsFollowing] = useState([]);
  const { ref, inView } = useInView({ threshold: 0.1 });
  useEffect(() => {
    const fetchPosts = async () => {
      // setLoading(true);
      try {
        const postsResult = await supabase
          .from("posts")
          .select("id, post, created_at, email, comments, reposts, views, media, original_post_id, reposter_email")
          .order("created_at", { ascending: false })
          .range(page * 3, (page + 1) * 3 - 1);

        if (postsResult.error) throw postsResult.error;

        if (postsResult.data.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prevPosts) => {
            const combined = [...prevPosts, ...postsResult.data];
            const uniquePosts = Array.from(new Map(combined.map((item) => [item.id, item])).values());
            return uniquePosts;
          });
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchReposts = async () => {
      // setLoading(true);
      try {
        const repostsResult = await supabase
          .from("reposts")
          .select("post_id, repost_id, reposter_email, comment, created_at")
          .order("created_at", { ascending: false })
          .range(repostPage * 3, (repostPage + 1) * 3 - 1);
        if (repostsResult.error) throw repostsResult.error;
        if (repostsResult.data.length === 0) {
          setHasMoreReposts(false);
        } else {
          // Update reposts state
          setReposts((prevRePosts) => {
            const combined = [...prevRePosts, ...repostsResult.data];
            const uniqueReposts = Array.from(new Map(combined.map((item) => [item.repost_id, item])).values());
            return uniqueReposts;
          });
        }
      } catch (error) {
        console.error("Error fetching reposts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReposts(); // Fetch reposts
    fetchPosts(); // Fetch posts
  }, [page, user.email, repostPage]);
  
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
  }, [user.email]);

  useEffect(() => {
    if ( hasMore && inView ) {
      setPage((prevPage) => prevPage + 1);
    }

    if ( hasMoreReposts && inView) {
      setRepostPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, inView, hasMoreReposts]);

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
      .channel("reposts-changes")
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

  const handleRepost = (postId, postEmail) => {
    setSelectedPost({ id: postId, email: postEmail });
    console.log("reposting");
  };

  const getReposts = (postId) => {
    const repostsArrayWithPostId = reposts.filter((repost) => repost.post_id === postId);
    return repostsArrayWithPostId.length;
  };

  const handleRepostSuccess = () => {
    setSelectedPost(null);
    // Optionally refetch posts or update the post list
  };

  const handleView = async (selectedPost) => {
    const emailToView = selectedPost.repost_id ? selectedPost.reposter_email : selectedPost.email;

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

  

  if (loading) {
    return (
      <div>
        <SkeletonChildren />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center flex-1 lg:border border-slate-800 lg:border-y-0 text-slate-100 shadow-lg lg:p-4 p-1">
      {(selectedItem === "" ||
        selectedItem === "!Groups" ||
        selectedItem === "Messages" ||
        selectedItem === "!Messages") && (
        <div className={`flex flex-col  ${showTop ? `mt-0` : `mt-32`} lg:mt-6 w-full`}>
          <UserPost />
          <div
            className={`${
              selectedItem === "!Messages" ? `grid lg:grid-cols-1 xl:grid-cols-2 gap-4 mt-2 ` : `flex flex-col gap-4 `
            }`}
          >
            {posts.length === 0 ? (
              <div className="text-2xl font-extrabold flex items-center justify-center mt-10">
                <div className="text-2xl font-extrabold flex items-center justify-center mt-10 mb-10 ">
                  <Box sx={{ display: "flex" }} className="flex gap-5">
                    <CircularProgress size={24} />
                  </Box>
                </div>
              </div>
            ) : (
              <>
                <Post
                  reposts={reposts}
                  search={search}
                  isFollowing={isFollowing}
                  getReposts={getReposts}
                  toggleCommentsVisibility={toggleCommentsVisibility}
                  handleRepost={handleRepost}
                  handleView={handleView}
                  commentsVisible={commentsVisible}
                  handleAddComment={handleAddComment}
                  posts={posts}
                  setPosts={setPosts}
                />
               {hasMore || hasMoreReposts?  <div className="text-2xl font-extrabold flex items-center justify-center mt-10 mb-10 observer" ref={ref}>
                  <Box sx={{ display: "flex" }} className="flex gap-5">
                    <CircularProgress size={24} />
                  </Box>
                </div>
                :""}
              </>
            )}
          </div>
        </div>
      )}
      <CustomModal email={postEmail} viewingPost={viewingPost} setViewingPost={setViewingPost}/>
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
