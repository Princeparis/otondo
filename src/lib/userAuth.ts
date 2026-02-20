import { Lucia } from "lucia";
import { PrismaLuciaAdapter } from "@/lib/prisma-lucia-adapter";
import prisma from "@/lib/db";
// We don't redeclare the lucia module here, rely on auth.ts
import { DatabaseUserAttributes } from "@/lib/auth-types";

const adapter = new PrismaLuciaAdapter(prisma, {
  sessionModel: "userSession",
  userModel: "user",
});

export const userAuth = new Lucia(adapter, {
  sessionCookie: {
    name: "storykids_user_session",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
      avatarUrl: attributes.avatarUrl,
    };
  },
});
