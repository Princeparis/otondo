import { NextRequest, NextResponse } from "next/server";
import { getStoryBySlug } from "@/lib/services/storyService";
import { StoryStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const slug = params.slug;
    const story = await getStoryBySlug(slug);

    if (!story || story.status !== StoryStatus.PUBLISHED) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Story not found" } },
        { status: 404 },
      );
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to fetch story detail:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch story details",
        },
      },
      { status: 500 },
    );
  }
}
