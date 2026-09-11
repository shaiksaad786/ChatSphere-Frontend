function MediaPreview({ file, onRemove }) {
  if (!file) return null;

  const previewUrl = URL.createObjectURL(file);

  const isImage = file.type.startsWith("image/");

  return (
    <div className="p-3 border-t bg-gray-50">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          {isImage ? (
            <img
              src={previewUrl}
              alt="preview"
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
              📄
            </div>
          )}

          <div>
            <p className="font-medium">
              {file.name}
            </p>

            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

        </div>

        <button
          onClick={onRemove}
          className="text-red-500 font-bold"
        >
          ✕
        </button>

      </div>

    </div>
  );
}

export default MediaPreview;