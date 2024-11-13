import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
import { useUser,useShowTop } from "../store/useStore";
import { Divider } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelected } from "../store/useSection";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
function Profile() {
  const { user } = useUser();
  const {showTop}=useShowTop();
  const router=useRouter();
  const { setSelectedItem } = useSelected();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const [numberFollowers, setNumberFollowers]=useState(0)
const [loading, setLoading]=useState(false)

const handleCloseSnackbar = () => {
  setOpenSnackbar(false);
};
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
      const data = await fetchProfileData(user.email);
      console.log(data,"email is ", user.email)
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
    setLoading(true)
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
    const {  error } = await supabase
      .from("users")
      .update({ profile: updatedProfileData })
      .eq("email", email);
    if (error) {
      console.error("Error updating profile data:", error);
      setOpenSnackbar(true);

      setSnackbarMessage("Error Occured");
      setSnackbarSeverity("An error ocurred, Try Again later!");
    } else {
      setLoading(false)
      setOpenSnackbar(true);
      setSnackbarMessage("You have successsfully Updated your profile!");
      setSnackbarSeverity("success");    }
  };
 
  const handleDisplayFollowers=(email)=>{router.push(`/pages/followers?email=${encodeURIComponent(email)}`)}
  return (
    <div className={`${showTop?`mt-0 top-0`:` mt-0`}   mx-auto lg:mt-3 top-0 p-4 bg-slate-900 rounded-xl w-full`}>
      <div className="flex gap-4 items-center text-xl"><span onClick={() => setSelectedItem("")}><ArrowBackIcon/></span><h3>Update Your Profile</h3></div>
      <div className="my-2"><Divider/></div>
      {/* Background Section */}
      <div
        className="relative h-48 mb-8 bg-gray-500 cursor-pointer rounded-xl"
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
          className="absolute -bottom-8 left-2 cursor-pointer"
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
              <span className="text-gray-500">Profile</span>
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
      <div className="mb-4 text-blue-400 active:bg-slate-400 rounded-lg px-3 py-2 hover:cursor-pointer hover:bg-slate-300" onClick={() => handleDisplayFollowers(email)} ><h3 className="font-semibold text-base">Followers:  {"  "+numberFollowers}</h3></div>
<div className="flex flex-col gap-4 items-start justify-start">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-gray-700 text-slate-100 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <textarea
          placeholder="About you"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="bg-gray-700 text-slate-100 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        ></textarea>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="bg-gray-700 text-slate-100 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-gray-700 text-slate-100 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-700 text-slate-100 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-gray-700 text-slate-100 px-4 py-2 w-full rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>
      <Snackbar open={openSnackbar} autoHideDuration={8000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
      >
       {loading? <CircularProgress size={24} style={{ marginRight: "8px" }} color="inherit"/>:""} Save Profile
      </button>
     
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

export default Profile;
