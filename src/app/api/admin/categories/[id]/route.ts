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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categoryId = (await params).id;
    const body = await req.json();
    const { name, description } = body;

    const currentCategory = await prisma.storyCategory.findUnique({
      where: { id: categoryId },
    });

    if (!currentCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;

    // Update slug only if name changes
    if (name && name !== currentCategory.name) {
      updateData.name = name;

      // Generate new base slug
      let baseSlug = slugify(name);
      let finalSlug = baseSlug;

      // Check new slug uniqueness excluding current category
      let slugExists = await prisma.storyCategory.findFirst({
        where: { slug: finalSlug, id: { not: categoryId } },
      });

      let counter = 1;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await prisma.storyCategory.findFirst({
          where: { slug: finalSlug, id: { not: categoryId } },
        });
        counter++;
      }

      updateData.slug = finalSlug;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updatedCategory = await prisma.storyCategory.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json(updatedCategory);
  } catch (e) {
    console.error("Failed to update category:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categoryId = (await params).id;

    await prisma.storyCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete category:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
