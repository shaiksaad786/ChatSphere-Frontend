import { useState } from "react";
import { createPoll } from "../../../services/pollService";

function PollCreator({
  conversationId,
  onCreated,
  onClose,
}) {
  const [question, setQuestion] = useState("");

  const [options, setOptions] = useState([
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);

  const updateOption = (index, value) => {
    const updated = [...options];

    updated[index] = value;

    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) {
      return;
    }

    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      return;
    }

    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    const cleanedOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (cleanedOptions.length < 2) {
      alert("Poll must have at least 2 options.");
      return;
    }

    try {
      setLoading(true);

      const response = await createPoll({
        conversationId,
        question: question.trim(),
        options: cleanedOptions,
      });

      alert("Poll created successfully!");

      if (onCreated) {
        onCreated(response);
      }

      setQuestion("");
      setOptions(["", ""]);
    } catch (error) {
      console.error("Poll creation error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to create poll."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">
            🗳️ Create Poll
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 text-xl"
          >
            ×
          </button>
        </div>

        {/* Question */}
        <label className="block font-semibold mb-2">
          Question
        </label>

        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something..."
          className="w-full border rounded-lg p-3 mb-5"
        />

        {/* Options */}
        <label className="block font-semibold mb-2">
          Options
        </label>

        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex gap-2"
            >
              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateOption(index, e.target.value)
                }
                placeholder={`Option ${index + 1}`}
                className="flex-1 border rounded-lg p-3"
              />

              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="px-3 text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add option */}
        {options.length < 6 && (
          <button
            onClick={addOption}
            className="mt-4 text-blue-600 font-medium"
          >
            + Add option
          </button>
        )}

        {/* Create */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </div>
  );
}

export default PollCreator;