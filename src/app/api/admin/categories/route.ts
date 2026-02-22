import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth.server";
import prisma from "@/lib/db";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    // Generate base slug
    let baseSlug = slugify(name);
    let finalSlug = baseSlug;

    // Ensure slug uniqueness
    let slugExists = await prisma.storyCategory.findUnique({
      where: { slug: finalSlug },
    });
    let counter = 1;
    while (slugExists) {
      finalSlug = `${baseSlug}-${counter}`;
      slugExists = await prisma.storyCategory.findUnique({
        where: { slug: finalSlug },
      });
      counter++;
    }

    // Get max sortOrder + 1
    const lastCategory = await prisma.storyCategory.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const nextSortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;

    const category = await prisma.storyCategory.create({
      data: {
        name,
        slug: finalSlug,
        description,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    console.error("Failed to create category:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
