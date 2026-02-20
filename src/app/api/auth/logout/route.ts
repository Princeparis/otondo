import { validateUserRequest } from "@/lib/userAuth.server";
import { userAuth } from "@/lib/userAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const { session } = await validateUserRequest();

  if (!session) {
    return redirect("/login");
  }

  await userAuth.invalidateSession(session.id);

  const sessionCookie = userAuth.createBlankSessionCookie();
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/");
}
