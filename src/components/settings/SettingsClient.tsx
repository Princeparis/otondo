"use client";

import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { UserAccountDropdown } from "@/components/auth/UserAccountDropdown";
import { useState, useRef, useTransition } from "react";
import {
  updateAvatar,
  removeAvatar,
  updateProfile,
  changePassword,
} from "@/app/settings/actions";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [isPendingAvatar, startAvatarTransition] = useTransition();
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingAuth, startAuthTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Profile Update
  const [name, setName] = useState(user.name);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // States for Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ type: "", text: "" });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startAvatarTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await updateAvatar(formData);
      if (!res.success) {
        alert(res.error || "Failed to upload avatar");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  const handleRemoveAvatar = () => {
    startAvatarTransition(async () => {
      const res = await removeAvatar();
      if (!res.success) {
        alert(res.error || "Failed to remove avatar");
      }
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });

    startProfileTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);

      const res = await updateProfile(formData);
      if (res.success) {
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
      } else {
        setProfileMessage({
          type: "error",
          text: res.error || "Failed to update profile.",
        });
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage({ type: "", text: "" });

    startAuthTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await changePassword(formData);
      if (res.success) {
        setAuthMessage({
          type: "success",
          text: "Password changed successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setAuthMessage({
          type: "error",
          text: res.error || "Failed to change password.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col font-sans">
      {/* Sleek Minimal Header */}
      <header className="h-16 border-b border-[#e6e4e0] bg-[#fafaf8]/80 backdrop-blur-xl flex items-center sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#1a1a1a] hover:opacity-80 transition-opacity"
          >
            otondo
          </Link>
          <div className="flex items-center gap-4">
            <UserAccountDropdown user={user} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#78756f] hover:text-[#1a1a1a] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight mb-4">
            Account Settings
          </h1>
          <p className="text-lg text-[#78756f] font-medium">
            Manage your personal profile and preferences.
          </p>
        </div>

        <div className="bg-white border border-[#e6e4e0] rounded-3xl p-8 md:p-12 shadow-sm space-y-12">
          {/* Section 1: Avatar */}
          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] border-b border-[#e6e4e0] pb-4 mb-6">
              Profile Picture
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div
                className="h-24 w-24 rounded-full bg-[#f0eeeb] flex items-center justify-center border-2 border-[#e6e4e0] shrink-0 overflow-hidden relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isPendingAvatar ? (
                  <Loader2 className="h-6 w-6 text-[#78756f] animate-spin" />
                ) : user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-[#78756f]" />
                )}
                {/* Overlay for fake upload */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarSelect}
                  disabled={isPendingAvatar}
                />
                <p className="text-sm text-[#78756f] mb-4">
                  Upload a new profile picture. Images will be automatically
                  cropped to a square and optimized.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPendingAvatar}
                    className="text-sm font-semibold px-4 py-2 bg-[#f0eeeb] text-[#1a1a1a] rounded-full hover:bg-[#e6e4e0] transition-colors disabled:opacity-50"
                  >
                    {isPendingAvatar ? "Uploading..." : "Upload New"}
                  </button>
                  {user.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isPendingAvatar}
                      className="text-sm font-semibold px-4 py-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Profile Info */}
          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] border-b border-[#e6e4e0] pb-4 mb-6">
              Personal Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] mb-2">
                  <User className="h-4 w-4 text-[#78756f]" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPendingProfile}
                  className="w-full h-12 px-4 rounded-xl border border-[#e6e4e0] bg-[#fafaf8] text-[#1a1a1a] font-medium outline-none focus:border-[#78756f] focus:ring-1 focus:ring-[#78756f] transition-all disabled:opacity-50"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] mb-2">
                  <Mail className="h-4 w-4 text-[#78756f]" />
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="w-full h-12 px-4 rounded-xl border border-[#e6e4e0] bg-[#f0eeeb] text-[#78756f] font-medium outline-none cursor-not-allowed opacity-80"
                />
                <p className="text-xs text-[#78756f] mt-2">
                  Email addresses cannot be changed at this time.
                </p>
              </div>

              {profileMessage.text && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${profileMessage.type === "success" ? "bg-[#eef5f1] text-[#7ab5a0]" : "bg-red-50 text-red-600"}`}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPendingProfile || name.trim() === ""}
                  className="px-8 py-3 rounded-full text-sm font-semibold text-white bg-[#1a1a1a] hover:bg-[#333] transition-colors shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPendingProfile && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Save Profile
                </button>
              </div>
            </form>
          </section>

          {/* Section 3: Password */}
          <section>
            <h2 className="text-xl font-bold text-[#1a1a1a] border-b border-[#e6e4e0] pb-4 mb-6">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] mb-2">
                  <Shield className="h-4 w-4 text-[#78756f]" />
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isPendingAuth}
                  className="w-full h-12 px-4 rounded-xl border border-[#e6e4e0] bg-[#fafaf8] text-[#1a1a1a] font-medium outline-none focus:border-[#78756f] focus:ring-1 focus:ring-[#78756f] transition-all disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] mb-2">
                  <Shield className="h-4 w-4 text-[#78756f]" />
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPendingAuth}
                  className="w-full h-12 px-4 rounded-xl border border-[#e6e4e0] bg-[#fafaf8] text-[#1a1a1a] font-medium outline-none focus:border-[#78756f] focus:ring-1 focus:ring-[#78756f] transition-all disabled:opacity-50"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] mb-2">
                  <Shield className="h-4 w-4 text-[#78756f]" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPendingAuth}
                  className="w-full h-12 px-4 rounded-xl border border-[#e6e4e0] bg-[#fafaf8] text-[#1a1a1a] font-medium outline-none focus:border-[#78756f] focus:ring-1 focus:ring-[#78756f] transition-all disabled:opacity-50"
                  required
                  minLength={8}
                />
              </div>

              {authMessage.text && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${authMessage.type === "success" ? "bg-[#eef5f1] text-[#7ab5a0]" : "bg-red-50 text-red-600"}`}
                >
                  {authMessage.text}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isPendingAuth ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="px-8 py-3 rounded-full text-sm font-semibold text-[#1a1a1a] bg-[#f0eeeb] hover:bg-[#e6e4e0] transition-colors shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPendingAuth && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
