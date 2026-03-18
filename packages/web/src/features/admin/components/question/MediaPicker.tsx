import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useMediaUpload } from "../../hooks/useMediaUpload";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const detectType = (url: string) => {
  if (/\.(mp4|webm|ogg)$/i.test(url)) return "video";
  if (/\.(mp3|wav|ogg|aac)$/i.test(url)) return "audio";
  return "image";
};

const MediaPreview = ({ url }: { url: string }) => {
  if (!url) return null;
  const type = detectType(url);
  if (type === "video")
    return <video src={url} controls className="mt-2 max-h-40 rounded" />;
  if (type === "audio")
    return <audio src={url} controls className="mt-2 w-full" />;
  return (
    <img
      src={url}
      alt="preview"
      className="mt-2 max-h-40 rounded object-contain"
    />
  );
};

const MediaPicker = ({
  value,
  onChange,
  label = "Media",
}: MediaPickerProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, error, upload } = useMediaUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) {
      onChange(url);
    }
    e.target.value = "";
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type="file"
        ref={fileRef}
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={state === "uploading"}
        >
          {state === "uploading" ? "Uploading..." : value ? "Replace file" : "Upload file"}
        </Button>
        {value && state !== "uploading" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {value && <MediaPreview url={value} />}
    </div>
  );
};

export default MediaPicker;
