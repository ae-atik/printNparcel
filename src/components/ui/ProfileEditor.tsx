// frontend/src/components/ui/ProfileEditor.tsx
import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { User as UserIcon, Camera, Save, X } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { GlassInput } from './GlassInput';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, uploadProfilePicture } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profilePicture: user?.profilePicture || '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const baseUrl =
    (import.meta.env.VITE_API_URL?.replace(/\/+$/, '') as string) || 'http://localhost:8080';

  const toAbsolute = (u?: string | null) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result); // preview only
      };
      reader.readAsDataURL(file);
    }
  };

const handleSave = async () => {
  try {
    // Update basic fields locally
    if (
      formData.firstName !== user?.firstName ||
      formData.lastName !== user?.lastName
    ) {
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    }

    // Upload the image if chosen
    if (selectedFile) {
      await uploadProfilePicture(selectedFile);
    }

    addToast({ type: 'success', title: 'Profile updated' });
    onClose();
  } catch (err: any) {
    addToast({
      type: 'error',
      title: 'Upload failed',
      message: err?.message || 'Please try a different image.',
    });
  }
};

  const handleClose = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      profilePicture: user?.profilePicture || '',
    });
    setPreviewImage(null);
    setSelectedFile(null);
    onClose();
  };

  const currentSrc = previewImage
    ? previewImage
    : toAbsolute(formData.profilePicture || user?.profilePicture || '');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile" size="md">
      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-glass-bg border-2 border-glass-border">
              {currentSrc ? (
                <img
                  src={currentSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={32} className="text-theme-text-muted" />
                </div>
              )}
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 w-8 h-8 bg-campus-green text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-campus-green-hover transition-colors"
            >
              <Camera size={16} />
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-theme-text-secondary">
            Click the camera icon to change your profile picture
          </p>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <GlassInput
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
          />
          <GlassInput
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <GlassButton variant="secondary" onClick={handleClose} className="flex-1">
            <X size={16} className="mr-2" />
            Cancel
          </GlassButton>
          <GlassButton variant="primary" onClick={handleSave} className="flex-1">
            <Save size={16} className="mr-2" />
            Save Changes
          </GlassButton>
        </div>
      </div>
    </Modal>
  );
};
