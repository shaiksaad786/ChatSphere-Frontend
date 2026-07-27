import { useEffect, useState } from "react";
import {
  getProfile,
  updatePreferences,
} from "../services/profileService";

function Settings() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getProfile();

      setTheme(data.user.theme || "light");
      setLanguage(data.user.preferredLanguage || "English");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await updatePreferences({
        theme,
        preferredLanguage: language,
      });

      alert(response.message);
    } catch (error) {
      console.log(error);
      alert("Failed to save settings");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

      <h1 className="text-3xl font-bold mb-8">
        Settings
      </h1>

      <div className="mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Theme
        </h2>

        <div className="space-y-3">

          <label className="flex items-center gap-3">
            <input
              type="radio"
              value="light"
              checked={theme === "light"}
              onChange={(e) => setTheme(e.target.value)}
            />
            Light
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              value="dark"
              checked={theme === "dark"}
              onChange={(e) => setTheme(e.target.value)}
            />
            Dark
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              value="system"
              checked={theme === "system"}
              onChange={(e) => setTheme(e.target.value)}
            />
            System
          </label>

        </div>

      </div>

      <div className="mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Preferred Language
        </h2>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border p-3 rounded w-full"
        >
          <option>English</option>
          <option>Telugu</option>
          <option>Hindi</option>
        </select>

      </div>

      <button
        onClick={handleSave}
        className="bg-indigo-600 text-white px-6 py-3 rounded"
      >
        Save Settings
      </button>

    </div>
  );
}

export default Settings;