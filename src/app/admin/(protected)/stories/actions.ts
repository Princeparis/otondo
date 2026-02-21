"use server";

import { validateRequest } from "@/lib/auth.server";
import { uploadBufferToR2 } from "@/lib/services/mediaService";

export async function uploadStoryMedia(formData: FormData) {
  const { user } = await validateRequest();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string;

  if (!file || !["covers", "audio"].includes(folder)) {
    return { success: false, error: "Invalid upload parameters" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadData = await uploadBufferToR2({
      buffer,
      contentType: file.type,
      fileName: file.name,
      folder: folder as "covers" | "audio",
    });

    return {
      success: true,
      publicUrl: uploadData.publicUrl,
      key: uploadData.key,
    };
  } catch (error) {
    console.error("Error uploading story media:", error);
    return { success: false, error: "Failed to process and upload media" };
  }
}
