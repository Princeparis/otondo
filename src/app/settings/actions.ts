"use server";

import { validateUserRequest } from "@/lib/userAuth.server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { uploadAvatarBuffer } from "@/lib/services/mediaService";
import sharp from "sharp";
import { hash, compare } from "bcrypt";

export async function updateAvatar(formData: FormData) {
  const { user } = await validateUserRequest();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("avatar") as File | null;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress to WebP and crop from center 1:1 using Sharp
    const processedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toBuffer();

    const { publicUrl } = await uploadAvatarBuffer({
      buffer: processedBuffer,
      contentType: "image/webp",
      extension: "webp",
    });

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: publicUrl },
    });

    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/stories");

    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: "Failed to process and upload avatar" };
  }
}

export async function removeAvatar() {
  const { user } = await validateUserRequest();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null },
    });

    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/stories");

    return { success: true };
  } catch (error) {
    console.error("Error removing avatar:", error);
    return { success: false, error: "Failed to remove avatar" };
  }
}

export async function updateProfile(formData: FormData) {
  const { user } = await validateUserRequest();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { success: false, error: "Name is required" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    });

    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath("/stories");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(formData: FormData) {
  const { user } = await validateUserRequest();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match" };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters",
    };
  }

  try {
    // Fetch full user record to verify current password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const isValid = await compare(currentPassword, dbUser.passwordHash);

    if (!isValid) {
      return { success: false, error: "Incorrect current password" };
    }

    const passwordHash = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
