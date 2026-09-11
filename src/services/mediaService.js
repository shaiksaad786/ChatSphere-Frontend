const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const uploadMedia = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/media/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Media upload failed");
  }

  return response.json();
};