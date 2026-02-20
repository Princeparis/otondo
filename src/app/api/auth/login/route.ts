import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verify } from "argon2";
import { userAuth } from "@/lib/userAuth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Missing or invalid email or password",
          },
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
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
        {
          error: {
            code: "INACTIVE_ACCOUNT",
            message: "Account is inactive",
          },
        },
        { status: 403 },
      );
    }

    const session = await userAuth.createSession(user.id, {});
    const sessionCookie = userAuth.createSessionCookie(session.id);

    return new Response(
      JSON.stringify({
        user: { id: user.id, email: user.email, name: user.name },
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
    console.error("Login error:", e);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to login" } },
      { status: 500 },
    );
  }
}
