import { useState } from "react";
import { uploadsApi } from "../api/uploads";

type UploadState = "idle" | "uploading" | "done" | "error";

export const useMediaUpload = () => {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setState("uploading");
    setError(null);
    try {
      const { url } = await uploadsApi.upload(file);
      setState("done");
      return url;
    } catch (err: unknown) {
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    }
  };

  const reset = () => {
    setState("idle");
    setError(null);
  };

  return { state, error, upload, reset };
};
