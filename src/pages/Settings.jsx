import { useState } from "react";

function Settings() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");

  const handleSave = () => {
    alert("Settings Saved Successfully");

    // Later:
    // Call API to save theme and language
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

      <h1 className="text-3xl font-bold mb-8">
        Settings
      </h1>

      {/* Theme Section */}

      <div className="mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Select Theme
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

      {/* Language Section */}

      <div className="mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Preferred Language
        </h2>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded p-3 w-full"
        >
          <option>English</option>
          <option>Telugu</option>
          <option>Hindi</option>
        </select>

      </div>

      {/* Save Button */}

      <button
        onClick={handleSave}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
      >
        Save Settings
      </button>

    </div>
  );
}

export default Settings;