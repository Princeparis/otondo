"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR";
  isActive: boolean;
  createdAt: string;
}

interface AdminManagementClientProps {
  currentUserId: string;
}

export function AdminManagementClient({
  currentUserId,
}: AdminManagementClientProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    isActive: true,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (e) {
      console.error("Failed to load admins", e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "EDITOR",
      isActive: true,
    });
    setFormError("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (admin: AdminUser) => {
    setDialogMode("edit");
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", // intentionally blank
      role: admin.role,
      isActive: admin.isActive,
    });
    setFormError("");
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const url =
        dialogMode === "create"
          ? "/api/admin/admins"
          : `/api/admin/admins/${selectedAdmin?.id}`;
      const method = dialogMode === "create" ? "POST" : "PATCH";

      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
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
        setFormError(data.error || "Failed to save admin");
        return;
      }

      await fetchAdmins();
      setIsDialogOpen(false);
    } catch (e) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/admins/${adminToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAdmins();
        setIsDeleteDialogOpen(false);
        setAdminToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete admin");
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
            Admins
          </h1>
          <p className="text-[13px] text-[#b0ada8] mt-0.5">
            Manage dashboard staff and permissions
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#1a1a1a] rounded-lg hover:bg-[#333] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Admin
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
                Role
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
                  Loading admins...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <Shield className="h-8 w-8 text-[#e6e4e0] mx-auto mb-3" />
                  <p className="text-[13px] text-[#b0ada8]">No admins found.</p>
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const isSelf = admin.id === currentUserId;

                return (
                  <tr
                    key={admin.id}
                    className="hover:bg-[#fafaf8] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1a1a1a] text-sm flex items-center gap-2">
                          {admin.name}{" "}
                          {isSelf && (
                            <span className="text-[10px] text-[#b0ada8] font-normal tracking-wide">
                              (YOU)
                            </span>
                          )}
                        </span>
                        <span className="text-[12px] text-[#78756f]">
                          {admin.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#78756f]">
                      <div className="flex items-center gap-1.5">
                        {admin.role === "SUPER_ADMIN" ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span
                          className={
                            admin.role === "SUPER_ADMIN"
                              ? "font-semibold text-amber-700"
                              : "font-medium text-blue-700"
                          }
                        >
                          {admin.role.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-[family-name:var(--font-mono)] text-[11px] font-semibold py-1 px-2 rounded-md inline-block ${
                          admin.isActive
                            ? "bg-[#eaf5ef] text-[#2e8555]"
                            : "bg-[#fef0ef] text-[#dc4a3f]"
                        }`}
                      >
                        {admin.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#b0ada8]">
                      {new Date(admin.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditDialog(admin)}
                          className="p-1.5 text-[#b0ada8] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-md transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(admin)}
                          disabled={isSelf}
                          className="p-1.5 text-[#b0ada8] hover:text-[#dc4a3f] hover:bg-[#fef0ef] rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#b0ada8]"
                          title={
                            isSelf ? "You cannot delete yourself" : undefined
                          }
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

      {/* Create/Edit Admin Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create New Admin" : "Edit Admin"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAdmin} className="space-y-4 mt-4">
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
                disabled={dialogMode === "edit"} // Prevent changing email to avoid collision complexities
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {dialogMode === "create"
                  ? "Initial Password"
                  : "Change Password (Optional)"}
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

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                disabled={selectedAdmin?.id === currentUserId}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                <option value="EDITOR">EDITOR</option>
              </select>
              {selectedAdmin?.id === currentUserId && (
                <p className="text-[11px] text-[#b0ada8] mt-1">
                  You cannot change your own role.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                disabled={selectedAdmin?.id === currentUserId}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-[#e6e4e0] text-[#1a1a1a] focus:ring-[#1a1a1a] disabled:opacity-50"
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                Admin account is active
              </Label>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#1a1a1a] text-white hover:bg-[#333]"
              >
                {isSaving ? "Saving..." : "Save Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#dc4a3f]">Delete Admin</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-[#78756f] mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-[#1a1a1a]">{adminToDelete?.name}</strong>?
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
                onClick={handleDeleteAdmin}
                disabled={isSaving}
                className="bg-[#dc4a3f] text-white hover:bg-[#c53d33]"
              >
                {isSaving ? "Deleting..." : "Delete Admin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
