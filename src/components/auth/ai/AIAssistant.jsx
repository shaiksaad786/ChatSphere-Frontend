import { useState } from "react";
import {
  smartReply,
  summarize,
  explain,
  rephrase,
  translateText,
} from "../../../services/aiService";

function AIAssistant({ messages, onUseReply, onClose }) {
  const [mode, setMode] = useState("smart");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [replies, setReplies] = useState([]);
  const [target, setTarget] = useState("te");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const latestText =
    messages?.length > 0
      ? messages[messages.length - 1]?.text || ""
      : "";

  const runAI = async () => {
    const text = input.trim() || latestText;

    if (!text) {
      setError("Enter or select some text first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setReplies([]);

    try {
      if (mode === "smart") {
        const data = await smartReply(text);
        setReplies(data.replies || []);
      }

      if (mode === "summarize") {
        const data = await summarize(text);
        setResult(data.summary || "");
      }

      if (mode === "rephrase") {
        const data = await rephrase(text);
        setResult(data.rephrasedText || "");
      }

      if (mode === "explain") {
        const data = await explain(text);
        setResult(data.explanation || "");
      }

      if (mode === "translate") {
        const data = await translateText({
          text,
          target,
        });

        setResult(
          data.translation ||
            data.translatedText ||
            data.text ||
            JSON.stringify(data)
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "AI request failed. Check that the backend and API key are running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-full md:w-[350px] border-l bg-white flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">✨ AI Assistant</h2>
          <p className="text-xs text-gray-500">Powered by your backend</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>
      </div>

      <div className="p-3 grid grid-cols-3 gap-2 border-b">
        {[
          ["smart", "Smart"],
          ["summarize", "Summary"],
          ["rephrase", "Rephrase"],
          ["explain", "Explain"],
          ["translate", "Translate"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={`px-2 py-2 rounded-lg text-xs font-medium ${
              mode === value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            latestText
              ? `Latest message: ${latestText.slice(0, 80)}`
              : "Enter text..."
          }
          className="w-full min-h-28 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {mode === "translate" && (
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full border rounded-lg p-2 mt-3"
          >
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="kn">Kannada</option>
          </select>
        )}

        <button
          onClick={runAI}
          disabled={loading}
          className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold"
        >
          {loading ? "Working..." : "✨ Generate"}
        </button>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-5 space-y-2">
            <h3 className="font-semibold">Smart replies</h3>
            {replies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onUseReply(reply)}
                className="w-full text-left p-3 border rounded-xl hover:bg-indigo-50"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {result && (
          <div className="mt-5">
            <h3 className="font-semibold mb-2">AI response</h3>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 whitespace-pre-wrap text-sm">
              {result}
            </div>

            {mode !== "translate" && (
              <button
                onClick={() => onUseReply(result)}
                className="w-full mt-3 border border-indigo-600 text-indigo-600 py-2 rounded-lg"
              >
                Use this in message
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default AIAssistant;
