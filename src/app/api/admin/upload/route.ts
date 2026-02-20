import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth.server";
import { getSignedUploadUrl } from "@/lib/services/mediaService";

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const { fileName, contentType, folder } = await req.json();

    if (!fileName || !contentType || !["covers", "audio"].includes(folder)) {
      return NextResponse.json(
        {
          error: { code: "BAD_REQUEST", message: "Invalid upload parameters" },
        },
        { status: 400 },
      );
    }

    const uploadData = await getSignedUploadUrl({
      fileName,
      contentType,
      folder: folder as "covers" | "audio",
    });

    return NextResponse.json(uploadData);
  } catch (e) {
    console.error("Failed to generate upload URL:", e);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate upload URL",
        },
      },
      { status: 500 },
    );
  }
}
