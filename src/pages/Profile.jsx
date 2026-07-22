import { useState } from "react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    name: "Shaik Saad",
    email: "saad@gmail.com",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    alert("Profile Updated Successfully");

    // Later:
    // Call Update Profile API here

    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

      <div className="flex flex-col items-center">

        <img
          src="https://i.pravatar.cc/150"
          alt="Profile"
          className="w-36 h-36 rounded-full border-4 border-indigo-600"
        />

        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
          Change Photo
        </button>

      </div>

      <div className="mt-10">

        <label className="font-semibold">
          Name
        </label>

        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-full border p-3 rounded mt-2"
        />

      </div>

      <div className="mt-6">

        <label className="font-semibold">
          Email
        </label>

        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-full border p-3 rounded mt-2"
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
              onClick={() => setIsEditing(false)}
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