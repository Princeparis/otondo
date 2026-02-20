"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react";

interface Story {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  category: { id: string; name: string };
  isFeatured: boolean;
  ageRangeMin: number;
  ageRangeMax: number;
}

export default function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch("/api/admin/stories");
        const data = await res.json();
        if (res.ok) {
          setStories(data.items);
        }
      } catch (e) {
        console.error("Failed to load stories", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  const statusStyles: Record<string, string> = {
    PUBLISHED: "bg-[#eef5f1] text-[#3d7a5a]",
    DRAFT: "bg-[#fef6e8] text-[#9a7b3c]",
    ARCHIVED: "bg-[#f0eeeb] text-[#78756f]",
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">
            Stories
          </h1>
          <p className="text-[13px] text-[#b0ada8] mt-0.5">
            Manage your storytelling content
          </p>
        </div>
        <Link
          href="/admin/stories/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#1a1a1a] rounded-lg hover:bg-[#333] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Story
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e6e4e0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e6e4e0] bg-[#fafaf8]">
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Title
              </th>
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Category
              </th>
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Status
              </th>
              <th className="text-left text-[12px] font-semibold text-[#78756f] uppercase tracking-wider px-5 py-3">
                Ages
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
                  Loading...
                </td>
              </tr>
            ) : stories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <BookOpen className="h-8 w-8 text-[#e6e4e0] mx-auto mb-3" />
                  <p className="text-[13px] text-[#b0ada8]">
                    No stories yet.{" "}
                    <Link
                      href="/admin/stories/new"
                      className="text-[#1a1a1a] font-semibold hover:underline"
                    >
                      Create your first story
                    </Link>
                  </p>
                </td>
              </tr>
            ) : (
              stories.map((story) => (
                <tr
                  key={story.id}
                  className="hover:bg-[#fafaf8] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-[#1a1a1a]">
                      {story.title}
                    </span>
                    {story.isFeatured && (
                      <span className="ml-2 text-[10px] font-semibold text-[#c4a46d] uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#78756f]">
                    {story.category?.name || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md ${statusStyles[story.status] || statusStyles.ARCHIVED}`}
                    >
                      {story.status.charAt(0) +
                        story.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#78756f] font-[family-name:var(--font-mono)]">
                    {story.ageRangeMin}–{story.ageRangeMax}
                  </td>
                  <td className="px-5 py-3.5 text-right">
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
