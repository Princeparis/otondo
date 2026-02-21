"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function generateAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return {
    bg: `hsl(${hue}, 70%, 90%)`,
    text: `hsl(${hue}, 70%, 20%)`,
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isActive: true,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedUser(null);
    setFormData({ name: "", email: "", password: "", isActive: true });
    setFormError("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // intentionally blank
      isActive: user.isActive,
    });
    setFormError("");
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const url =
        dialogMode === "create"
          ? "/api/admin/users"
          : `/api/admin/users/${selectedUser?.id}`;
      const method = dialogMode === "create" ? "POST" : "PATCH";

      // Only include password if we are creating, or if editing and it's not empty
      const payload: any = {
        name: formData.name,
        email: formData.email,
        isActive: formData.isActive,
      };

      if (dialogMode === "create" || formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error?.message || "Failed to save user");
        return;
      }

      await fetchUsers();
      setIsDialogOpen(false);
    } catch (e) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchUsers();
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error?.message || "Failed to delete user");
      }
    } catch (e) {
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">
            Users
          </h1>
          <p className="text-[13px] text-[#b0ada8] mt-0.5">
            Manage public app user accounts
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#1a1a1a] rounded-lg hover:bg-[#333] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e6e4e0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e6e4e0] bg-[#fafaf8]">
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3 w-[250px]">
                Name
              </th>
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Email
              </th>
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Status
              </th>
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Joined
              </th>
              <th className="text-right text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e4e0]">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-16 text-center text-[13px] text-[#b0ada8]"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <Users className="h-8 w-8 text-[#e6e4e0] mx-auto mb-3" />
                  <p className="text-[13px] text-[#b0ada8]">
                    No users found.{" "}
                    <button
                      onClick={openCreateDialog}
                      className="text-[#1a1a1a] font-semibold hover:underline"
                    >
                      Create your first user
                    </button>
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const avatarColors = generateAvatarColor(user.name || "User");
                const initials = (user.name || "User")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[#fafaf8] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.avatarUrl && (
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                          )}
                          <AvatarFallback
                            style={{
                              backgroundColor: avatarColors.bg,
                              color: avatarColors.text,
                            }}
                            className="text-[11px] font-bold"
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-[#1a1a1a] text-sm">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#78756f]">
                      {user.email}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-[family-name:var(--font-mono)] text-[11px] font-semibold py-1 px-2 rounded-md inline-block ${
                          user.isActive
                            ? "bg-[#eaf5ef] text-[#2e8555]"
                            : "bg-[#fef0ef] text-[#dc4a3f]"
                        }`}
                      >
                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#b0ada8]">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditDialog(user)}
                          className="p-1.5 text-[#b0ada8] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-md transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(user)}
                          className="p-1.5 text-[#b0ada8] hover:text-[#dc4a3f] hover:bg-[#fef0ef] rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create New User" : "Edit User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4 mt-4">
            {formError && (
              <div className="p-3 text-sm text-[#dc4a3f] bg-[#fef0ef] rounded-md border border-[#f9d7d4]">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {dialogMode === "create"
                  ? "Password"
                  : "New Password (Optional)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={dialogMode === "create"}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-[#e6e4e0] text-[#1a1a1a] focus:ring-[#1a1a1a]"
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                User account is active
              </Label>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#1a1a1a] text-white hover:bg-[#333]"
              >
                {isSaving ? "Saving..." : "Save User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#dc4a3f]">Delete User</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-[#78756f] mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-[#1a1a1a]">{userToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isSaving}
                className="bg-[#dc4a3f] text-white hover:bg-[#c53d33]"
              >
                {isSaving ? "Deleting..." : "Delete User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
