import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth.server";
import { uploadBufferToR2 } from "@/lib/services/mediaService";

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string;

    if (!file || !["covers", "audio"].includes(folder)) {
      return NextResponse.json(
        {
          error: { code: "BAD_REQUEST", message: "Invalid upload parameters" },
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadData = await uploadBufferToR2({
      buffer,
      contentType: file.type,
      fileName: file.name,
      folder: folder as "covers" | "audio",
    });

    return NextResponse.json({
      uploadUrl: null, // No longer using presigned URLs
      publicUrl: uploadData.publicUrl,
      key: uploadData.key,
    });
  } catch (e) {
    console.error("Failed to upload file:", e);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to upload file",
        },
      },
      { status: 500 },
    );
  }
}
