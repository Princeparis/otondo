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

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      title,
      categoryId,
      status,
      description,
      isFeatured,
      ageRangeMin,
      ageRangeMax,
      coverImageId,
      audioId,
      contentBlocks,
    } = body;

    // Basic validation
    if (!title || !categoryId) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Title and Category are required",
          },
        },
        { status: 400 },
      );
    }

    // Generate base slug
    let baseSlug = slugify(title);
    let finalSlug = baseSlug;

    // Ensure slug uniqueness
    let slugExists = await prisma.story.findUnique({
      where: { slug: finalSlug },
    });
    let counter = 1;
    while (slugExists) {
      finalSlug = `${baseSlug}-${counter}`;
      slugExists = await prisma.story.findUnique({
        where: { slug: finalSlug },
      });
      counter++;
    }

    const story = await prisma.story.create({
      data: {
        title,
        slug: finalSlug,
        status: status || StoryStatus.DRAFT,
        shortDescription: description || "",
        body: contentBlocks ? JSON.stringify(contentBlocks) : "",
        isFeatured: isFeatured || false,
        ageRangeMin,
        ageRangeMax,
        createdByAdminId: user.id,
        categoryId,
        coverImageId,
        audioId,
        publishedAt: status === StoryStatus.PUBLISHED ? new Date() : null,
      },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (e) {
    console.error("Failed to create story:", e);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create story" } },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page") as string)
      : 1;
    const pageSize = searchParams.has("pageSize")
      ? parseInt(searchParams.get("pageSize") as string)
      : 10;
    const skip = (page - 1) * pageSize;

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        include: {
          category: true,
          coverImage: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.story.count(),
    ]);

    return NextResponse.json({
      items: stories,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (e) {
    console.error("Failed to fetch admin stories:", e);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch stories" } },
      { status: 500 },
    );
  }
}
