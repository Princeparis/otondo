"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) {
          setCategories(data);
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

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
        <button className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#1a1a1a] rounded-lg hover:bg-[#333] transition-colors">
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
                    <button className="text-[#1a1a1a] font-semibold hover:underline">
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
                      <button className="p-1.5 text-[#b0ada8] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-md transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 text-[#b0ada8] hover:text-[#dc4a3f] hover:bg-[#fef0ef] rounded-md transition-colors">
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
    </div>
  );
}
