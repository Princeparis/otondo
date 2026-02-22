"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedCategory(null);
    setFormData({ name: "", description: "" });
    setFormError("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setDialogMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setFormError("");
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const url =
        dialogMode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${selectedCategory?.id}`;
      const method = dialogMode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to save category");
        return;
      }

      await fetchCategories();
      setIsDialogOpen(false);
    } catch (e) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCategories();
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category");
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
            Categories
          </h1>
          <p className="text-[13px] text-[#b0ada8] mt-0.5">
            Manage story taxonomies
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#1a1a1a] rounded-lg hover:bg-[#333] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Category
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
                Slug
              </th>
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Description
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
                  colSpan={4}
                  className="px-5 py-16 text-center text-[13px] text-[#b0ada8]"
                >
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <Layers className="h-8 w-8 text-[#e6e4e0] mx-auto mb-3" />
                  <p className="text-[13px] text-[#b0ada8]">
                    No categories found.{" "}
                    <button
                      onClick={openCreateDialog}
                      className="text-[#1a1a1a] font-semibold hover:underline"
                    >
                      Create your first category
                    </button>
                  </p>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-[#fafaf8] transition-colors"
                >
                  <td className="px-5 py-4 font-semibold text-[#1a1a1a] text-sm">
                    {cat.name}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[#78756f] bg-[#f0eeeb] py-1 px-2 rounded-md inline-block">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#78756f] truncate max-w-[300px]">
                    {cat.description || "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditDialog(cat)}
                        className="p-1.5 text-[#b0ada8] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-md transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(cat)}
                        className="p-1.5 text-[#b0ada8] hover:text-[#dc4a3f] hover:bg-[#fef0ef] rounded-md transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? "Create New Category"
                : "Edit Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4 mt-4">
            {formError && (
              <div className="p-3 text-sm text-[#dc4a3f] bg-[#fef0ef] rounded-md border border-[#f9d7d4]">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Science Fiction"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A brief description of this category..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#1a1a1a] text-white hover:bg-[#333]"
              >
                {isSaving ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#dc4a3f]">
              Delete Category
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-[#78756f] mb-6">
              Are you sure you want to delete the{" "}
              <strong className="text-[#1a1a1a]">
                {categoryToDelete?.name}
              </strong>{" "}
              category? Stories in this category will not be deleted, but they
              will lose their category assignment.
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
                onClick={handleDeleteCategory}
                disabled={isSaving}
                className="bg-[#dc4a3f] text-white hover:bg-[#c53d33]"
              >
                {isSaving ? "Deleting..." : "Delete Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
