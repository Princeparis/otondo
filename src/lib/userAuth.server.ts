import { cookies } from "next/headers";
import { userAuth } from "@/lib/userAuth";
import type { Session, User } from "lucia";
import { cache } from "react";

export const validateUserRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const cookieStore = await cookies();
    const sessionId =
      cookieStore.get(userAuth.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return { user: null, session: null };
    }

    const result = await userAuth.validateSession(sessionId);

    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = userAuth.createSessionCookie(result.session.id);
        const nextCookieStore = await cookies();
        nextCookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = userAuth.createBlankSessionCookie();
        const nextCookieStore = await cookies();
        nextCookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}
    return result;
  },
);
