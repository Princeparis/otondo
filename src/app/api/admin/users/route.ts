import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth.server";
import prisma from "@/lib/db";
import { hash } from "argon2";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        avatarUrl: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (e) {
    console.error("GET users error:", e);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "An unknown error occurred" },
      },
      { status: 500 },
    );
  }
}

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
    const { name, email, password, isActive } = body;

    // Basic validation
    if (!name || typeof name !== "string" || name.length < 2) {
      return NextResponse.json(
        { error: { code: "INVALID_NAME", message: "Invalid name provided." } },
        { status: 400 },
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          error: { code: "INVALID_EMAIL", message: "Invalid email provided." },
        },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PASSWORD",
            message: "Password must be at least 6 characters.",
          },
        },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: "USER_EXISTS",
            message: "A user with this email already exists.",
          },
        },
        { status: 400 },
      );
    }

    const passwordHash = await hash(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (e) {
    console.error("POST user error:", e);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "An unknown error occurred" },
      },
      { status: 500 },
    );
  }
}
