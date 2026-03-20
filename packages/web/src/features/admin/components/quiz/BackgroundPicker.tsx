import { useEffect, useRef, useState } from "react";
import { backgroundsApi } from "../../api/backgrounds";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

const MIN_WIDTH = 1920;
const MIN_HEIGHT = 1080;

const checkImageDimensions = (
  file: File,
): Promise<{ valid: boolean; width: number; height: number }> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: img.naturalWidth >= MIN_WIDTH && img.naturalHeight >= MIN_HEIGHT,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, width: 0, height: 0 });
    };
    img.src = url;
  });

interface BackgroundPickerProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  onApplyToAll: (url: string | undefined) => void;
}

const BackgroundPicker = ({
  value,
  onChange,
  onApplyToAll,
}: BackgroundPickerProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("library");
  const [library, setLibrary] = useState<{ key: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(value);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dimensionError, setDimensionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLibrary = async () => {
    try {
      const items = await backgroundsApi.list();
      setLibrary(items);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (open) {
      setSelected(value);
      setUploadFile(null);
      setDimensionError(null);
      fetchLibrary();
    }
  }, [open, value]);

  const handleDelete = async (key: string) => {
    try {
      await backgroundsApi.deleteBackground(key);
      if (selected === library.find((i) => i.key === key)?.url) {
        setSelected(undefined);
      }
      await fetchLibrary();
    } catch {
      // ignore
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const result = await backgroundsApi.upload(uploadFile);
      setSelected(result.url);
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchLibrary();
      setActiveTab("library");
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  const handleApply = () => {
    onChange(selected || undefined);
    setOpen(false);
  };

  const handleApplyToAll = () => {
    onApplyToAll(selected || undefined);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        {value ? (
          <>
            <img
              src={value}
              alt="bg preview"
              className="h-5 w-8 rounded object-cover"
            />
            <span>Change Background</span>
          </>
        ) : (
          <span>Choose Background</span>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl w-[560px] max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Choose Background</h2>
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="library">Library</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mb-3"
                    onClick={() => setSelected(undefined)}
                  >
                    Use Default
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    {library.map((item) => (
                      <div key={item.key} className="relative group">
                        <img
                          src={item.url}
                          alt="background"
                          onClick={() => setSelected(item.url)}
                          className={`h-24 w-full cursor-pointer rounded object-cover ${
                            selected === item.url
                              ? "ring-2 ring-primary"
                              : "ring-1 ring-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleDelete(item.key)}
                          className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white text-xs leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {library.length === 0 && (
                      <p className="col-span-3 text-sm text-gray-500 text-center py-8">
                        No backgrounds uploaded yet.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-4">
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Minimum size:{" "}
                      <span className="font-semibold text-gray-700">
                        {MIN_WIDTH}×{MIN_HEIGHT}px
                      </span>{" "}
                      · Recommended: 1920×1080px or higher · Image only
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] ?? null;
                        setDimensionError(null);
                        setUploadFile(null);
                        if (!file) return;
                        const { valid, width, height } =
                          await checkImageDimensions(file);
                        if (!valid) {
                          setDimensionError(
                            `Image too small (${width}×${height}px). Minimum is ${MIN_WIDTH}×${MIN_HEIGHT}px.`,
                          );
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                          return;
                        }
                        setUploadFile(file);
                      }}
                    />
                    {dimensionError && (
                      <p className="text-sm text-red-500">{dimensionError}</p>
                    )}
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={!uploadFile || uploading || !!dimensionError}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="px-6 py-4 border-t flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyToAll}
              >
                Apply to all questions
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackgroundPicker;
