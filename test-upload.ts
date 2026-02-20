import { uploadAvatarBuffer } from "./src/lib/services/mediaService";
import fs from "fs";
import sharp from "sharp";

async function test() {
  try {
    console.log("Reading file...");
    const buffer = fs.readFileSync("/tmp/avatar.png");
    console.log("File read. Processing with sharp...");

    const processedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toBuffer();

    console.log("Sharp processed successfully. Uploading...");
    const result = await uploadAvatarBuffer({
      buffer: processedBuffer,
      contentType: "image/webp",
      extension: "webp",
    });
    console.log("Success:", result);
  } catch (error: any) {
    console.error("Upload failed with error:", error.message);
    if (error.$metadata) {
      console.error("AWS metadata:", error.$metadata);
    }
  }
}

test();
