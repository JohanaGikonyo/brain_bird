import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

function CustomProfile({email}) {
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [fullImage, setFullImage] = useState(null);
const [numberFollowers, setNumberFollowers]=useState(0)
  const fetchProfileData = async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("profile, connections")
      .eq("email", email)
      .single();
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
     setNumberFollowers(data.connections.length)
    return data.profile; 
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await fetchProfileData(email);
      if (data) {
        setUsername(data.username || "");
        setAbout(data.about || "");
        setCountry(data.country || "");
        setCity(data.city || "");
        setPhone(data.phone || "");
        setProfilePic(data.profile_pic || null);
        setBackgroundImg(data.background_img || null);
        setFullImage(data.fullImage || null);
      }
    };
    fetchProfile();
  }, [email]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Background Section */}
      <div
        className="relative h-48 mb-4 bg-gray-300"
        style={{ backgroundImage: backgroundImg ? `url(${backgroundImg})` : "" }}
      >
        {/* Profile Avatar */}
        <div className="absolute bottom-0 left-0">
          {profilePic ? (
            <Image
              src={profilePic}
              width={96}
              height={96}
              alt="Profile"
              className="rounded-full w-24 h-24"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-gray-500">Profile</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="mb-4 text-blue-400"><h3 className="font-semibold text-base">Followers:  {"  "+numberFollowers}</h3></div>
      <div className="mb-4">
        <label>              <h3 className="font-semibold text-base">Name:</h3>
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label>              <h3 className="font-semibold text-base">About:</h3>
        </label>
        <textarea
          placeholder="About "
          value={about}
          readOnly
          className="text-gray-400 bg-gray-800  px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        ></textarea>
      </div>

      <div className="mb-4">
        <label>              <h3 className="font-semibold text-base">Country:</h3>
        </label>
        <input
          type="text"
          placeholder="Country"
          value={country}
          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label>              <h3 className="font-semibold text-base">City:</h3>
        </label>
        <input
          type="text"
          placeholder="City"
          value={city}
          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label>              <h3 className="font-semibold text-base">Email:</h3>
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
        <label>              <h3 className="font-semibold text-base">Phone:</h3>
        </label>
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          readOnly
          className="text-gray-400 bg-gray-800 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      {/* Full Image Modal */}
      {fullImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={() => setFullImage(null)}
        >
          <Image src={fullImage} alt="Full Profile" layout="fill" objectFit="contain" />
        </div>
      )}
    </div>
  );
}

export default CustomProfile;
