import prisma from "../db";
import { StoryStatus } from "@prisma/client";

export const getPublicStories = async ({
  categoryId,
  ageMin,
  ageMax,
  page = 1,
  pageSize = 10,
}: {
  categoryId?: string;
  ageMin?: number;
  ageMax?: number;
  page?: number;
  pageSize?: number;
}) => {
  const skip = (page - 1) * pageSize;

  // Filter conditions for public viewing
  const where: any = {
    status: StoryStatus.PUBLISHED,
    publishedAt: { lte: new Date() },
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (ageMin !== undefined) {
    where.ageRangeMin = { gte: ageMin };
  }

  if (ageMax !== undefined) {
    where.ageRangeMax = { lte: ageMax };
  }

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where,
      include: {
        category: true,
        coverImage: true,
        audio: true,
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.story.count({ where }),
  ]);

  return {
    items: stories,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getStoryBySlug = async (slug: string) => {
  return prisma.story.findUnique({
    where: { slug },
    include: {
      category: true,
      coverImage: true,
      audio: true,
      createdByAdmin: {
        select: { name: true },
      },
    },
  });
};

export const getCategories = async () => {
  return prisma.storyCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });
};
