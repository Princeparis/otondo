import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth.server";
import prisma from "@/lib/db";
import { hash } from "argon2";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await validateRequest();

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = (await params).id;
    const body = await req.json();
    const { name, role, isActive, password } = body;

    // Prevent modifying the last SUPER_ADMIN to a lesser role or inactive
    if ((role === "EDITOR" || isActive === false) && adminId === user.id) {
      return NextResponse.json(
        { error: "Cannot demote or deactivate yourself" },
        { status: 403 },
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (role === "SUPER_ADMIN" || role === "EDITOR") updateData.role = role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    if (password) {
      updateData.passwordHash = await hash(password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updatedAdmin = await prisma.adminUser.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedAdmin);
  } catch (e) {
    console.error("Failed to update admin:", e);
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

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = (await params).id;

    if (adminId === user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 403 },
      );
    }

    await prisma.adminUser.delete({
      where: { id: adminId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete admin:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
