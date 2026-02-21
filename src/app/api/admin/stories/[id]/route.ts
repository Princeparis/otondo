import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth.server";
import prisma from "@/lib/db";
import { StoryStatus } from "@prisma/client";

// Simple slugify helper
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const { id } = await params;

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        category: true,
        coverImage: true,
        audio: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Story not found" } },
        { status: 404 },
      );
    }

    const serializedStory = {
      ...story,
      ...(story.coverImage && {
        coverImage: {
          ...story.coverImage,
          sizeBytes: story.coverImage.sizeBytes?.toString() || null,
        },
      }),
      ...(story.audio && {
        audio: {
          ...story.audio,
          sizeBytes: story.audio.sizeBytes?.toString() || null,
        },
      }),
    };

    return NextResponse.json(serializedStory);
  } catch (e) {
    console.error("Failed to fetch story:", e);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch story" } },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      categoryId,
      status,
      description,
      isFeatured,
      ageRangeMin,
      ageRangeMax,
      coverMedia,
      audioMedia,
      body: storyBody,
    } = body;

    // Check if story exists
    const existingStory = await prisma.story.findUnique({ where: { id } });
    if (!existingStory) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Story not found" } },
        { status: 404 },
      );
    }

    // Generate base slug
    let baseSlug = title ? slugify(title) : existingStory.slug;
    let finalSlug = baseSlug;

    if (title && title !== existingStory.title) {
      // Ensure slug uniqueness if title changed
      let slugExists = await prisma.story.findUnique({
        where: { slug: finalSlug },
      });
      let counter = 1;
      while (slugExists && slugExists.id !== id) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await prisma.story.findUnique({
          where: { slug: finalSlug },
        });
        counter++;
      }
    }

    // Handle Media Asset Creation if new media is uploaded
    let newCoverImageId = undefined;
    if (coverMedia) {
      const coverAsset = await prisma.mediaAsset.create({
        data: {
          type: "IMAGE",
          url: coverMedia.url,
          bucket: process.env.R2_BUCKET_NAME || "storykids",
          objectKey: coverMedia.key,
          mimeType: coverMedia.mimeType,
          sizeBytes: coverMedia.sizeBytes,
          createdByAdminId: user.id,
        },
      });
      newCoverImageId = coverAsset.id;
    }

    let newAudioId = undefined;
    if (audioMedia) {
      const audioAsset = await prisma.mediaAsset.create({
        data: {
          type: "AUDIO",
          url: audioMedia.url,
          bucket: process.env.R2_BUCKET_NAME || "storykids",
          objectKey: audioMedia.key,
          mimeType: audioMedia.mimeType,
          sizeBytes: audioMedia.sizeBytes,
          createdByAdminId: user.id,
        },
      });
      newAudioId = audioAsset.id;
    }

    const story = await prisma.story.update({
      where: { id },
      data: {
        ...(title && { title }),
        slug: finalSlug,
        ...(status && { status }),
        ...(description !== undefined && { shortDescription: description }),
        ...(storyBody !== undefined && { body: storyBody }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(ageRangeMin !== undefined && { ageRangeMin }),
        ...(ageRangeMax !== undefined && { ageRangeMax }),
        updatedByAdminId: user.id,
        ...(categoryId && { categoryId }),
        ...(newCoverImageId && { coverImageId: newCoverImageId }),
        ...(newAudioId && { audioId: newAudioId }),
        ...(status === StoryStatus.PUBLISHED &&
          existingStory.status !== StoryStatus.PUBLISHED && {
            publishedAt: new Date(),
          }),
      },
    });

    return NextResponse.json(story);
  } catch (e) {
    console.error("Failed to update story:", e);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update story" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const { id } = await params;

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Story not found" } },
        { status: 404 },
      );
    }

    await prisma.story.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete story:", e);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete story" } },
      { status: 500 },
    );
  }
}
