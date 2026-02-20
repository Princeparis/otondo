import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth.server";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    return NextResponse.json({
      admin: user,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "An unknown error occurred" },
      },
      { status: 500 },
    );
  }
}
