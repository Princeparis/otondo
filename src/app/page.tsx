import HomeClient from "@/components/home/HomeClient";
import { validateUserRequest } from "@/lib/userAuth.server";
import db from "@/lib/db";

export default async function Home() {
  const { user } = await validateUserRequest();

  const featuredStoriesRaw = await db.story.findMany({
    where: { status: "PUBLISHED" },
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      ageRangeMin: true,
      ageRangeMax: true,
    },
  });

  const featuredStories = featuredStoriesRaw.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    coverImage: s.coverImage?.url || null,
    ageRangeMin: s.ageRangeMin,
    ageRangeMax: s.ageRangeMax,
  }));

  const marqueeStories =
    featuredStories.length > 0
      ? featuredStories
      : [
          {
            id: "mock-1",
            title: "The Magic Treehouse",
            slug: "magic-treehouse",
            coverImage: null,
            ageRangeMin: 4,
            ageRangeMax: 8,
          },
          {
            id: "mock-2",
            title: "Sleepy Bear's Big Day",
            slug: "sleepy-bear",
            coverImage: null,
            ageRangeMin: 2,
            ageRangeMax: 5,
          },
          {
            id: "mock-3",
            title: "Outer Space Friends",
            slug: "outer-space-friends",
            coverImage: null,
            ageRangeMin: 3,
            ageRangeMax: 6,
          },
          {
            id: "mock-4",
            title: "The Brave Little Toaster",
            slug: "brave-little-toaster",
            coverImage: null,
            ageRangeMin: 5,
            ageRangeMax: 9,
          },
          {
            id: "mock-5",
            title: "Mystery of the Hidden Cave",
            slug: "mystery-hidden-cave",
            coverImage: null,
            ageRangeMin: 7,
            ageRangeMax: 12,
          },
        ];

  return <HomeClient user={user} featuredStories={marqueeStories} />;
}
