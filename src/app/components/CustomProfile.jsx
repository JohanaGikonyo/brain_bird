import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
function CustomProfile({ email }) {
    const router=useRouter();
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

  const handleDisplayFollowers=(email)=>{router.push(`/pages/CustomFollowers?email=${encodeURIComponent(email)}`)}


  return (
    <div className=" w-full">
      {/* Background Section */}
      <div
        className="relative h-48 mb-8 bg-gray-300 w-full rounded-xl"
        style={{ backgroundImage: profileData?.background_img ? `url(${profileData.background_img})` : "" }}      >
        {/* Profile Avatar */}
        <div className="absolute -bottom-8 left-2">
          {profileData?.profile_pic ? (
            <Avatar
            alt="User Avatar"
            src={profileData?.profile_pic}
            sx={{
              color: "white",
              fontSize:  "1.5rem",
              width:'6rem',
              height:'6rem'
              
            }}
          >
            
            </Avatar>          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-gray-500">Profile</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="mb-4 text-blue-400 flex gap-4  items-center">
        <button className="font-semibold text-base rounded-lg px-3 py-0 border border-blue-400 mt-5 hover:cursor-pointer" onClick={() => handleDisplayFollowers(email)}>Followers: {"  " + numberFollowers}</button>
        <button className="border border-blue-400 text-blue-400 py-0 px-3 rounded-lg" onClick={() => handleDisplayFollowers(email)}>View</button>
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
