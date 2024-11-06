import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
function CustomProfile({ email }) {
  const [profileData, setProfileData] = useState(null);
  const [numberFollowers, setNumberFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchProfileData = async (email) => {
    const { data, error } = await supabase.from("users").select("profile, connections").eq("email", email).single();
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    setNumberFollowers(data.connections?.length || 0);
    return data.profile;
  };
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const data = await fetchProfileData(email);
      if (data) {
        setProfileData(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [email]);
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className=" w-full">
      {/* Background Section */}
      <div
        className="relative h-48 mb-4 bg-gray-300 w-full rounded-xl"
        style={{ backgroundImage: profileData?.background_img ? `url(${profileData.background_img})` : "" }}      >
        {/* Profile Avatar */}
        <div className="absolute bottom-0 left-0">
          {profileData?.profile_pic ? (
            <Image src={profileData?.profile_pic} width={96} height={96} alt="Profile" className="rounded-full w-24 h-24" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-gray-500">Profile</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="mb-4 text-blue-400">
        <h3 className="font-semibold text-base">Followers: {"  " + numberFollowers}</h3>
      </div>
      <div className="mb-4">
        <label>
          {" "}
          <h3 className="font-semibold text-base">Name:</h3>
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          value={profileData?.username || "no username set"}          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label>
          {" "}
          <h3 className="font-semibold text-base">About:</h3>
        </label>
        <textarea
          placeholder="About "
          value={profileData?.about || "no details"}          readOnly
          className="text-gray-400 bg-gray-800  px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        ></textarea>
      </div>

      <div className="mb-4">
        <label>
          {" "}
          <h3 className="font-semibold text-base">Country:</h3>
        </label>
        <input
          type="text"
          placeholder="Country"
          value={profileData?.country || "not defined"}          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label>
          {" "}
          <h3 className="font-semibold text-base">City:</h3>
        </label>
        <input
          type="text"
          placeholder="City"
          value={profileData?.city || "not defined"}        
            readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label>
          {" "}
          <h3 className="font-semibold text-base">Email:</h3>
        </label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label>
          {" "}
          <h3 className="font-semibold text-base">Phone:</h3>
        </label>
        <input
          type="tel"
          placeholder="Phone"
          value={profileData?.phone || "+254"}
          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      
    </div>
  );
}

export default CustomProfile;
