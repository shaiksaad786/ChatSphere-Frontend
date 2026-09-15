import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profileService";
import { uploadMedia } from "../services/mediaService";
import { usePreferences } from "../context/AppPreferences";

function Profile() {
  const { t } = usePreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePic: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();

      setUser({
        name: data.user.name,
        email: data.user.email,
        profilePic: data.user.profilePic || "",
      });
    } catch (error) {
      console.log(error);
      alert("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const response = await updateProfile({
        name: user.name,
        profilePic: user.profilePic,
      });

      alert(response.message);
      setIsEditing(false);

      fetchProfile();
    } catch (error) {
      console.log(error);
      alert("Profile Update Failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

      <div className="flex flex-col items-center">

        <img
          src={
            user.profilePic
              ? user.profilePic
              : "https://i.pravatar.cc/150"
          }
          alt="Profile"
          className="w-36 h-36 rounded-full border-4 border-indigo-600"
        />

        <button
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Change Photo
        </button>

      </div>

      <div className="mt-8">

        <label>Name</label>

        <input
          type="text"
          name="name"
          value={user.name}
          disabled={!isEditing}
          onChange={handleChange}
          className="border p-3 w-full rounded mt-2"
        />

      </div>

      <div className="mt-6">

        <label>Email</label>

        <input
          type="email"
          value={user.email}
          disabled
          className="border p-3 w-full rounded mt-2 bg-gray-100"
        />

      </div>

      <div className="mt-8 flex gap-4">

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Save
            </button>

            <button
              onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>
          </>
        )}

      </div>

    </div>
  );
}

export default Profile;