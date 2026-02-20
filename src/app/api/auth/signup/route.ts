import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hash } from "argon2";
import { userAuth } from "@/lib/userAuth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Missing or invalid name, email, or password",
          },
        },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: "EMAIL_EXISTS",
            message: "Email is already registered",
          },
        },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    const session = await userAuth.createSession(user.id, {});
    const sessionCookie = userAuth.createSessionCookie(session.id);

    return new Response(
      JSON.stringify({
        user: { id: user.id, email: user.email, name: user.name },
      }),
      {
        status: 201,
        headers: {
          "Set-Cookie": sessionCookie.serialize(),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to sign up" } },
      { status: 500 },
    );
  }
}
