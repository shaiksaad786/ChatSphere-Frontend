import api from "./api";

// Get Profile
export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Update Profile
export const updateProfile = async (profileData) => {
  const response = await api.put("/users/profile", profileData);
  return response.data;
};

// Update Theme & Language
export const updatePreferences = async (preferenceData) => {
  const response = await api.put(
    "/users/preferences",
    preferenceData
  );

  return response.data;
};
export const searchUsers = async (query) => {
  const response = await api.get("/users/search", { params: { q: query } });
  return response.data.users || [];
};
