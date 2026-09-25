import { useState } from "react";
import { translateText } from "../../../services/translationService";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "te", name: "Telugu" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "bn", name: "Bengali" },
];

function TranslationButton({
  text,
  targetLanguage = "te",
}) {
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text?.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await translateText({
        text,
        source: "auto",
        target: targetLanguage,
      });

      setTranslated(result);
    } catch (error) {
      console.error("Translation failed:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Translation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {!translated && (
        <button
          type="button"
          onClick={handleTranslate}
          disabled={loading}
          className="text-xs underline opacity-80 hover:opacity-100 disabled:opacity-50"
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}

      {translated && (
        <div className="mt-2 pt-2 border-t border-gray-200/50">
          <p className="text-[11px] opacity-60 mb-1">
            Translation
          </p>

          <p className="text-sm whitespace-pre-wrap">
            {translated}
          </p>

          <button
            type="button"
            onClick={() => setTranslated("")}
            className="text-xs underline mt-1 opacity-70"
          >
            Show original
          </button>
        </div>
      )}
    </div>
  );
}

export default TranslationButton;