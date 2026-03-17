import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState } from "react";
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
  const [urlInput, setUrlInput] = useState(value || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, error, upload } = useMediaUpload();

  const handleUrlCommit = () => {
    onChange(urlInput);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) {
      onChange(url);
      setUrlInput(url);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <Tabs defaultValue="url">
        <TabsList>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="url">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleUrlCommit}
              placeholder="https://..."
            />
            <Button size="sm" onClick={handleUrlCommit}>
              OK
            </Button>
          </div>
          <MediaPreview url={value} />
        </TabsContent>
        <TabsContent value="upload">
          <input
            type="file"
            ref={fileRef}
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={state === "uploading"}
          >
            {state === "uploading" ? "Uploading..." : "Choose file"}
          </Button>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          {value && state === "done" && <MediaPreview url={value} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaPicker;
