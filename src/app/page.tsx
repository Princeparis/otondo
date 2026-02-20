import HomeClient from "@/components/home/HomeClient";
import { validateUserRequest } from "@/lib/userAuth.server";

export default async function Home() {
  const { user } = await validateUserRequest();

  return <HomeClient user={user} />;
}
