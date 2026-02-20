"use client";

import { StoryEditorForm } from "@/components/admin/forms/StoryEditorForm";

export default function NewStoryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-primary tracking-tight">
          Create New Story
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload media and configure story details.
        </p>
      </div>

      <StoryEditorForm />
    </div>
  );
}
