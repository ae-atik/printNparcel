import React, { useState } from 'react';
import { User, Camera, Save, X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassInput } from './GlassInput';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profilePicture: user?.profilePicture || '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      profilePicture: formData.profilePicture,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      profilePicture: user?.profilePicture || '',
    });
    setPreviewImage(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile" size="md">
      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-glass-bg border-2 border-glass-border">
              {previewImage || formData.profilePicture ? (
                <img
                  src={previewImage || formData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={32} className="text-theme-text-muted" />
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
          <p className="text-sm text-theme-text-secondary">Click the camera icon to change your profile picture</p>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <GlassInput
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
          <GlassInput
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <GlassButton
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            <X size={16} className="mr-2" />
            Cancel
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={handleSave}
            className="flex-1"
          >
            <Save size={16} className="mr-2" />
            Save Changes
          </GlassButton>
        </div>
      </div>
    </Modal>
  );
};