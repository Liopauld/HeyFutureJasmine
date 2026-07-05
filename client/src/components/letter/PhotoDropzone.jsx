import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useUpload } from "../../hooks/useUpload.js";

export default function PhotoDropzone({ photos, onAdd, onRemove }) {
  const upload = useUpload();

  const onDrop = useCallback(
    async (files) => {
      for (const file of files) {
        try {
          const att = await upload.mutateAsync({ file });
          onAdd(att);
        } catch (e) {
          toast.error(e.response?.data?.message || "Couldn't attach that photo");
          break;
        }
      }
    },
    [upload, onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 8 * 1024 * 1024
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-6 text-center transition ${
          isDragActive ? "border-gold bg-gold/5" : "border-grand-line hover:border-gold/50"
        }`}
      >
        <input {...getInputProps()} />
        {upload.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
        ) : (
          <ImagePlus className="h-5 w-5 text-text-muted" />
        )}
        <p className="text-xs text-text-muted">
          {upload.isPending ? "Stowing aboard…" : "Drop a photo, or click to browse"}
        </p>
      </div>

      {photos.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p._id} className="group relative h-16 w-16 overflow-hidden rounded-lg">
              <img src={p.secureUrl} alt={p.originalName || "photo"} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(p._id)}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
