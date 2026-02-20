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

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        { error: { code: "INVALID_USER_ID", message: "User ID is required" } },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { name, email, password, isActive } = body;

    const dataToUpdate: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length < 2) {
        return NextResponse.json(
          { error: { code: "INVALID_NAME", message: "Invalid name provided" } },
          { status: 400 },
        );
      }
      dataToUpdate.name = name;
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return NextResponse.json(
          {
            error: { code: "INVALID_EMAIL", message: "Invalid email provided" },
          },
          { status: 400 },
        );
      }

      // Check for email collision
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          {
            error: {
              code: "EMAIL_IN_USE",
              message: "This email is already registered to another user",
            },
          },
          { status: 400 },
        );
      }

      dataToUpdate.email = email.toLowerCase();
    }

    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_PASSWORD",
              message: "Password must be at least 6 characters",
            },
          },
          { status: 400 },
        );
      }
      dataToUpdate.passwordHash = await hash(password);
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_STATUS",
              message: "isActive must be a boolean",
            },
          },
          { status: 400 },
        );
      }
      dataToUpdate.isActive = isActive;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        {
          error: { code: "NO_UPDATES", message: "No data provided to update" },
        },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (e) {
    if ((e as any).code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 },
      );
    }
    console.error("PATCH user error:", e);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "An unknown error occurred" },
      },
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

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        { error: { code: "INVALID_USER_ID", message: "User ID is required" } },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if ((e as any).code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 },
      );
    }
    console.error("DELETE user error:", e);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "An unknown error occurred" },
      },
      { status: 500 },
    );
  }
}
