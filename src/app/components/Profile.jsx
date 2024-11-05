import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../store/useStore";

function Profile() {
  const { user } = useUser();
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [fullImage, setFullImage] = useState(null);

  const fetchProfileData = async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("profile")
      .eq("email", email)
      .single();
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    return data.profile;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await fetchProfileData(user.email);
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
  }, [user.email]);

  const handleProfilePicChange = (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImgChange = (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const updatedProfileData = {
      username,
      about,
      country,
      city,
      email,
      phone,
      profile_pic: profilePic,
      background_img: backgroundImg,
    };
    const { data, error } = await supabase
      .from("users")
      .update({ profile: updatedProfileData })
      .eq("email", email);
    if (error) {
      console.error("Error updating profile data:", error);
    } else {
      console.log("Profile data updated successfully:", data);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Background Section */}
      <div
        className="relative h-48 mb-4 bg-gray-300 cursor-pointer"
        style={{ backgroundImage: backgroundImg ? `url(${backgroundImg})` : "" }}
        onClick={(e) => {
          e.stopPropagation();
          document.getElementById("background-upload").click();
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleBackgroundImgChange}
          className="hidden"
          id="background-upload"
        />

        {/* Profile Avatar */}
        <div
          className="absolute bottom-0 left-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById("profile-upload").click();
          }}
        >
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
              <span className="text-gray-500">Avatar</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            className="hidden"
            id="profile-upload"
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-gray-200 text-slate-950 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <textarea
          placeholder="About you"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="bg-gray-200 text-slate-950 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        ></textarea>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-gray-200 text-slate-950 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-gray-200 text-slate-950 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-200 text-slate-950 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-gray-200 text-slate-950 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Save Profile
      </button>

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

export default Profile;
