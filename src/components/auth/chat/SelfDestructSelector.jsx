import { useState } from "react";
import api from "../../../services/api";

function SelfDestructSelector({
  messageId,
  onUpdated,
}) {
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;

    setDuration(value);

    if (!value || !messageId) {
      return;
    }

    try {
      setLoading(true);

      const expiresAt = new Date(
        Date.now() + Number(value) * 1000
      ).toISOString();

      const response = await api.put(
        `/messages/${messageId}/self-destruct`,
        {
          expiresAt,
        }
      );

      if (onUpdated) {
        onUpdated(response.data);
      }
    } catch (error) {
      console.error(
        "Self destruct error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to set self-destruct."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={duration}
      onChange={handleChange}
      disabled={loading}
      className="border rounded-lg px-2 py-1 text-sm bg-white"
      title="Self-destruct timer"
    >
      <option value="">
        💣 Self-destruct
      </option>

      <option value="10">
        10 seconds
      </option>

      <option value="30">
        30 seconds
      </option>

      <option value="60">
        1 minute
      </option>

      <option value="300">
        5 minutes
      </option>

      <option value="3600">
        1 hour
      </option>

      <option value="86400">
        24 hours
      </option>
    </select>
  );
}

export default SelfDestructSelector;