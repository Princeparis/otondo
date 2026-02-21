import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Cloudflare R2 endpoint format: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a signed URL to upload a file directly to Cloudflare R2 from the client.
 */
export async function getSignedUploadUrl({
  fileName,
  contentType,
  folder,
}: {
  fileName: string;
  contentType: string;
  folder: "covers" | "audio";
}) {
  const extension = fileName.split(".").pop();
  const uniqueKey = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: uniqueKey,
    ContentType: contentType,
  });

  // URL expires in 15 minutes (900 seconds)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  return {
    uploadUrl: signedUrl,
    key: uniqueKey,
    publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueKey}`,
  };
}

/**
 * Uploads a Buffer directly to Cloudflare R2 from the server.
 */
export async function uploadAvatarBuffer({
  buffer,
  contentType,
  extension = "webp",
}: {
  buffer: Buffer;
  contentType: string;
  extension?: string;
}) {
  const uniqueKey = `avatars/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: uniqueKey,
    ContentType: contentType,
    Body: buffer,
  });

  await s3Client.send(command);

  return {
    key: uniqueKey,
    publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueKey}`,
  };
}

/**
 * Uploads a Buffer directly to Cloudflare R2 from the server (Generic).
 */
export async function uploadBufferToR2({
  buffer,
  contentType,
  fileName,
  folder,
}: {
  buffer: Buffer;
  contentType: string;
  fileName: string;
  folder: "covers" | "audio";
}) {
  const extension = fileName.split(".").pop();
  const uniqueKey = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: uniqueKey,
    ContentType: contentType,
    Body: buffer,
  });

  await s3Client.send(command);

  return {
    key: uniqueKey,
    publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueKey}`,
  };
}
