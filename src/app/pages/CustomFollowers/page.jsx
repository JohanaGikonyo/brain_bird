"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import CustomProfile from "@apply/app/components/CustomProfile";
import CustomAvatar from "@apply/app/components/CustomAvatar";
import { useUser } from "../../store/useStore";
import Follow from "../../components/Follow";
function CustomFollowers() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [followers, setFollowers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [viewingFollower, setViewingFollower] = useState(null);
  const [activeTab, setActiveTab] = useState("Following");
  useEffect(() => {
    if (email) {
      fetchFollowers(email);
      fetchAllUsers();
    }
  }, [email, user.email]);
  const fetchFollowers = async (targetEmail) => {
    // Fetch all users to find followers of the target email user
    const { data: allFollowers, error } = await supabase
      .from("users")
      .select("connections")
      .eq("email", targetEmail)
      .single();
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setFollowers(allFollowers?.connections || []);
  };
  const fetchAllUsers = async () => {
    // Fetch all users
    const { data: allUsers, error } = await supabase.from("users").select("email");
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setAllUsers(allUsers.map((u) => u.email));
  };
 
  const handleView = (followerEmail) => {
    setViewingFollower(followerEmail);
  };
  const closeModal = () => {
    setViewingFollower(null);
  };

  return (
    <div className="bg-slate-950 min-h-screen lg:py-6 lg:px-4 py-2 px-1">
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-lg shadow-lg p-6">
        <h2 className="lg:text-2xl font-semibold text-gray-300 mb-4">Connections for<CustomAvatar email={email}/>  </h2>

        <div className="flex justify-start space-x-6 mb-6">
          <button
            onClick={() => setActiveTab("Following")}
            className={`text-lg font-medium py-2 px-4 rounded-lg transition duration-300 ${
              activeTab === "Following"
                ? "text-blue-600 border-b-2 border-blue-600 border-transparent"
                : "text-white hover:border-blue-600"
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => setActiveTab("for you")}
            className={`text-lg font-medium py-2 px-4 rounded-lg transition duration-300 ${
              activeTab === "for you"
                ? "text-blue-600 border-b-2 border-blue-600 border-transparent"
                : "text-white hover:border-blue-600"
            }`}
          >
            For You
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "Following" && (
            <div>
              {followers?.length > 0 ? (
                followers.map((followerEmail) => (
                  <div
                    key={followerEmail}
                    className="flex items-center justify-between bg-slate-900 hover:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer transition"
                  >
                    <div className="flex items-center" onClick={() => handleView(followerEmail)}>
                      <CustomAvatar email={followerEmail} />
                    </div>
                    <Follow email={followerEmail} currentUserEmail={user.email}/>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No followers yet.</p>
              )}
            </div>
          )}

          {activeTab === "for you" && (
            <div>
              {allUsers.length > 0 ? (
                allUsers.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-slate-900 hover:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer transition"
                  >
                    <div className="flex items-center" onClick={() => handleView(email)}>
                      <CustomAvatar email={email} />
                    </div>
                    {/* <button
                      onClick={() => handleFollow(email)}
                      className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                      Follow
                    </button> */}
                    <Follow email={email} currentUserEmail={user.email}/>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users to follow.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {viewingFollower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md md:max-w-lg mx-4 md:mx-0 p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500 transition duration-200 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex flex-col items-center space-y-6">
                <CustomProfile email={viewingFollower} />
                {/* <p className="text-lg font-medium text-gray-800 dark:text-gray-300">{viewingFollower}</p> */}
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                  Detailed information about the user can be viewed here.
                </p>
              </div>
            </div>

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
    </div>
  );
}

export default CustomFollowers;
