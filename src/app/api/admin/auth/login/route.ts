import { NextRequest, NextResponse } from "next/server";
import { lucia } from "@/lib/auth";
import prisma from "@/lib/db";
import { verify } from "argon2";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (
      typeof email !== "string" ||
      email.length < 3 ||
      email.length > 255 ||
      !/.+@.+\..+/.test(email)
    ) {
      return NextResponse.json(
        { error: { code: "INVALID_EMAIL", message: "Invalid email" } },
        { status: 400 },
      );
    }
    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return NextResponse.json(
        { error: { code: "INVALID_PASSWORD", message: "Invalid password" } },
        { status: 400 },
      );
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await verify(user.passwordHash, password))) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Incorrect email or password",
          },
        },
        { status: 400 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: { code: "INACTIVE_ACCOUNT", message: "Account is inactive" } },
        { status: 403 },
      );
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return new Response(
      JSON.stringify({
        admin: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": sessionCookie.serialize(),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e) {
    console.error("Login route error:", e);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "An unknown error occurred" },
      },
      { status: 500 },
    );
  }
}
