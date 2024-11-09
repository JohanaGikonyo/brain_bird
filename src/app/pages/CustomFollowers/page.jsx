"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import CustomProfile from "@apply/app/components/CustomProfile";
import CustomAvatar from "@apply/app/components/CustomAvatar";
import { useUser } from "../../store/useStore";
function CustomFollowers() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [following, setFollowing] = useState([]);
  const [notFollowed, setNotFollowed] = useState([]);
  const [viewingFollower, setViewingFollower] = useState(null);
  const [activeTab, setActiveTab] = useState("Following");
  const [deviceFollowers, setDeviceFollowers] = useState([]);
  useEffect(() => {
    if (email) {
      fetchFollowersAndFollowing(email);
      fetchFollowersOfDeviceUser(user.email);
    }
  }, [email, user.email]);
  const fetchFollowersOfDeviceUser = async (userEmail) => {
    const { data: currentUser, error } = await supabase
      .from("users")
      .select("connections")
      .eq("email", userEmail)
      .single();
    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }
    const deviceFollowers = currentUser?.connections || [];
    setDeviceFollowers(deviceFollowers);
  };
  
    const fetchFollowersAndFollowing = async (userEmail) => {
      const { data: currentUser, error } = await supabase
        .from("users")
        .select("connections")
        .eq("email", userEmail)
        .single();
      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }
      const followingEmails = currentUser?.connections || [];
      setFollowing(followingEmails);
      const { data: allUsers } = await supabase.from("users").select("email, connections");
      const usersYouCanFollow = allUsers.filter(
        (user) => !followingEmails.includes(user.email) && user.connections?.includes(userEmail)
      );
      setNotFollowed(usersYouCanFollow.map((user) => user.email));
    }
  const handleView = (followerEmail) => {
    setViewingFollower(followerEmail);
  };
  const closeModal = () => {
    setViewingFollower(null);
  };
  const handleFollow = async (followerEmail) => {
    try {
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("users")
        .select("connections")
        .eq("email", email)
        .single();
      if (currentUserError) {
        console.error("Error fetching current user connections:", currentUserError);
        return;
      }
      const updatedConnections = [...(currentUserData.connections || []), followerEmail];
      const { error: updateError } = await supabase
        .from("users")
        .update({ connections: updatedConnections })
        .eq("email", email);
      if (updateError) {
        console.error("Error updating connections:", updateError);
        return;
      }
      setFollowing((prev) => [...prev, followerEmail]);
      setNotFollowed((prev) => prev.filter((user) => user !== followerEmail));
    } catch (error) {
      console.error("An error occurred during follow:", error);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen lg:py-6 lg:px-4 py-2 px-1">
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-lg shadow-lg p-6">
        <h2 className="lg:text-2xl font-semibold text-gray-300 mb-4">Connections for {email}</h2>

        <div className="flex justify-start space-x-6 mb-6">
          <button
            onClick={() => setActiveTab("Following")}
            className={`text-lg font-medium py-2 px-4 rounded-lg transition duration-300 ${
              activeTab === "Following"
                ? "text-blue-600 border-b-2 border-blue-600 border-transparent"
                : "text-white   hover:border-blue-600"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveTab("for you")}
            className={`text-lg font-medium py-2 px-4 rounded-lg transition duration-300 ${
              activeTab === "for you"
                ? "  text-blue-600  border-blue-600 border-b-2 border-transparent"
                : "text-white   hover:border-blue-600"
            }`}
          >
            For you
          </button>
        </div>

        <div className="space-y-4">
          {/* Display Following List */}
          {activeTab === "Following" && (
            <div>
              {following.length > 0 ? (
                following.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-slate-900 hover:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer transition"
                    onClick={() => handleView(email)}
                  >
                    <div className="flex items-center" onClick={() => handleView(email)}>
                      <CustomAvatar email={email} />
                    </div>
                    {!deviceFollowers.includes(email) ? (
                      ""
                    ) : (
                      <button
                        onClick={() => handleFollow(user.email)}
                        className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users are being followed yet.</p>
              )}
            </div>
          )}

          {/* Display Followers Not Followed Back List */}
          {activeTab === "for you" && (
            <div>
              {notFollowed.length > 0 ? (
                notFollowed.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-slate-900 hover:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer transition"
                  >
                    <div className="flex items-center" onClick={() => handleView(email)}>
                      <CustomAvatar email={email} />
                    </div>
                    {!deviceFollowers.includes(email) ? (
                      ""
                    ) : (
                      <button
                        onClick={() => handleFollow(user.email)}
                        className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users to follow.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Viewing Follower Profile */}
      {viewingFollower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md md:max-w-lg mx-4 md:mx-0 p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile</h2>
              <button
                onClick={() => closeModal()}
                className="text-gray-500 hover:text-red-500 transition duration-200 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex flex-col items-center space-y-3">
                  <CustomProfile email={viewingFollower} />
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-300">{viewingFollower}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                    Detailed information about the user can be viewed here.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => closeModal()}
                className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomFollowers;
