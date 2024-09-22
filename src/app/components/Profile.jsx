import React, { useState } from "react";
import Image from "next/image";
function Profile() {
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [fullImage, setFullImage] = useState(null);

  const handleProfilePicChange = (e) => {
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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    setFullImage(profilePic);
  };

  const handleCloseFullImage = () => {
    setFullImage(null);
  };

  return (
    <div className="profile-container">
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          height: "200px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleBackgroundImgChange}
          style={{ display: "none" }}
          id="background-upload"
        />
        <label htmlFor="background-upload" className="upload-button">
          Upload Background Image
        </label>
      </div>

      <div className="profile-picture">
        {profilePic ? (
          <Image
            href={profilePic}
            alt="Profile"
            onClick={handleImageClick}
            style={{ borderRadius: "50%", width: "100px", height: "100px", cursor: "pointer" }}
          />
        ) : (
          <div
            className="default-avatar"
            style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#ccc" }}
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePicChange}
          style={{ display: "none" }}
          id="profile-upload"
        />
        <label htmlFor="profile-upload" className="upload-button">
          Upload Profile Picture
        </label>
      </div>

      <div>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginTop: "10px" }}
          className="bg-slate-200 px-4 py-2 text-slate-500 outline-none focus:outline-0  rounded-lg"
        />
      </div>

      {fullImage && (
        <div className="full-image-modal" onClick={handleCloseFullImage}>
          <Image href={fullImage} alt="Full Profile" style={{ maxWidth: "90%", maxHeight: "90%" }} />
        </div>
      )}
    </div>
  );
}

export default Profile;
