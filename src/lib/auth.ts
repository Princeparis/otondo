import { Lucia } from "lucia";
import { PrismaLuciaAdapter } from "@/lib/prisma-lucia-adapter";
import prisma from "@/lib/db";
import { DatabaseUserAttributes } from "@/lib/auth-types";

const adapter = new PrismaLuciaAdapter(prisma, {
  sessionModel: "session",
  userModel: "adminUser",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "storykids_admin_session",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
      role: attributes.role,
      isActive: attributes.isActive,
      avatarUrl: attributes.avatarUrl,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
