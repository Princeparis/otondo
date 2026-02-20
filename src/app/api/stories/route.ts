import { NextRequest, NextResponse } from "next/server";
import { getPublicStories } from "@/lib/services/storyService";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get("category") || undefined;
    const ageMin = searchParams.has("ageMin")
      ? parseInt(searchParams.get("ageMin") as string)
      : undefined;
    const page = searchParams.has("page")
      ? parseInt(searchParams.get("page") as string)
      : 1;
    const pageSize = searchParams.has("pageSize")
      ? parseInt(searchParams.get("pageSize") as string)
      : 10;

    const data = await getPublicStories({ categoryId, ageMin, page, pageSize });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch stories" } },
      { status: 500 },
    );
  }
}
