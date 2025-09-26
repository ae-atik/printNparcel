import React, { useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

type Props = {
  /**
   * If not provided, the component will use the currently logged-in user (from AuthContext).
   */
  userId?: string;
  /**
   * Called after a successful upload with the new (server) image URL.
   */
  onUploaded?: (absoluteUrl: string) => void;
  /**
   * Render size of the avatar square (px). Default: 120.
   */
  size?: number;
  /**
   * Optional className for container.
   */
  className?: string;
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/jpg"];

export default function AvatarUploader({ userId, onUploaded, size = 120, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { user, uploadProfilePicture: uploadFromCtx } = useAuth();
  const effectiveUserId = userId ?? (user?.id as string) ?? "";
  const currentAvatar = useMemo(
    () => (preview ? preview : (user?.profilePicture ?? "")),
    [preview, user]
  );

  const onPickClick = () => inputRef.current?.click();

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please select a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Max size is 5MB.");
      return;
    }

    // Preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      setBusy(true);
      await uploadFromCtx(file);
      
      // Backend responds via AuthContext and updates user state
      // We can call onUploaded with a placeholder since the user state will be updated automatically
      onUploaded?.(""); // empty string since user state will have the updated URL
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center"
      >
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="text-sm text-gray-500">No avatar</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-600">
          PNG / JPG / WEBP • Auto-cropped to square • 250×250px stored
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPickClick}
            disabled={busy || !effectiveUserId}
            className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {busy ? "Uploading..." : "Upload new"}
          </button>
          {preview && !busy && (
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
            >
              Cancel preview
            </button>
          )}
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!effectiveUserId && (
          <div className="text-xs text-amber-600">
            You must be logged in to upload an avatar.
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={onFileSelected}
      />
    </div>
  );
}
