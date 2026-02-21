"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StoryEditorForm } from "@/components/admin/forms/StoryEditorForm";
import { Loader2 } from "lucide-react";

export default function EditStoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await fetch(`/api/admin/stories/${id}`);
        if (!res.ok) {
          router.push("/admin/stories");
          return;
        }
        const data = await res.json();
        setStory(data);
      } catch (error) {
        console.error("Failed to fetch story:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchStory();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-primary tracking-tight">
          Edit Story
        </h1>
        <p className="text-muted-foreground mt-1">
          Modify media and configure story details.
        </p>
      </div>

      <StoryEditorForm
        initialData={story}
        isEditing={true}
        storyId={id as string}
      />
    </div>
  );
}
