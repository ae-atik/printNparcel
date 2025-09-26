import React, { useState } from "react";
import AvatarUploader from "../AvatarUploader";
import { useAuth } from "../../context/AuthContext";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";
import { GlassCard } from "../ui/GlassCard";
import { User, Phone } from "lucide-react";

export default function ProfileSettings() {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [error, setError] = useState('');

  const displayName =
    (user?.firstName || "") + (user?.lastName ? (" " + user.lastName) : "") || user?.username || user?.email || "User";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await updateProfile({
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 gradient-text">Profile Settings</h1>

      {!user ? (
        <GlassCard className="p-6">
          <div className="text-theme-text-secondary">
            You are not logged in. Please sign in to manage your profile.
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-medium mb-4">Profile Picture</h2>
            <AvatarUploader
              userId={user.id as string}
              size={120}
              onUploaded={() => {
                /* AuthContext already updates user + busts cache */
              }}
            />
          </GlassCard>

          {/* Profile Information Section */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Profile Information</h2>
              {!isEditing && (
                <GlassButton
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  size="sm"
                >
                  Edit
                </GlassButton>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-component bg-danger/10 border border-danger/20 text-danger text-sm mb-4">
                {error}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    icon={<User size={20} />}
                    required
                  />
                  <GlassInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    icon={<User size={20} />}
                  />
                </div>
                
                <GlassInput
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  icon={<Phone size={20} />}
                  placeholder="+1 (555) 000-0000"
                />

                <div className="flex gap-3 pt-2">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    glow
                  >
                    Save Changes
                  </GlassButton>
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </GlassButton>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-theme-text-muted">Name</div>
                  <div className="font-medium text-theme-text">{displayName}</div>
                </div>
                <div>
                  <div className="text-theme-text-muted">Email</div>
                  <div className="font-medium text-theme-text">{user.email}</div>
                </div>
                <div>
                  <div className="text-theme-text-muted">Phone Number</div>
                  <div className="font-medium text-theme-text">{user.phoneNumber || "—"}</div>
                </div>
                <div>
                  <div className="text-theme-text-muted">Username</div>
                  <div className="font-medium text-theme-text">{user.username || "—"}</div>
                </div>
                <div>
                  <div className="text-theme-text-muted">University</div>
                  <div className="font-medium text-theme-text">{user.university || "—"}</div>
                </div>
                <div>
                  <div className="text-theme-text-muted">Hall</div>
                  <div className="font-medium text-theme-text">{user.hall || "—"}</div>
                </div>
                <div>
                  <div className="text-theme-text-muted">Balance</div>
                  <div className="font-medium text-theme-text">৳{typeof user.credits === "number" ? user.credits.toFixed(2) : "0.00"}</div>
                </div>
                <div>
                  <div className="text-theme-text-muted">Role</div>
                  <div className="font-medium text-theme-text">
                    {Array.isArray(user.roles) ? user.roles.join(", ") : (user.roles || "user")}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
