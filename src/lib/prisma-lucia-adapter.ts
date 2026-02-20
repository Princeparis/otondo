import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";
import type { PrismaClient } from "@prisma/client";

/**
 * Custom Lucia adapter for Prisma 7+ (which uses driver adapters
 * and is incompatible with @lucia-auth/adapter-prisma).
 *
 * This adapter is generic: you pass in the Prisma model names
 * for sessions and users, and it uses the Prisma client directly.
 */
export class PrismaLuciaAdapter implements Adapter {
  private prisma: PrismaClient;
  private sessionModel: string;
  private userModel: string;

  constructor(
    prisma: PrismaClient,
    options: { sessionModel: string; userModel: string },
  ) {
    this.prisma = prisma;
    this.sessionModel = options.sessionModel;
    this.userModel = options.userModel;
  }

  // Helper to access a Prisma model dynamically
  private get sessionDelegate(): any {
    return (this.prisma as any)[this.sessionModel];
  }

  private get userDelegate(): any {
    return (this.prisma as any)[this.userModel];
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.sessionDelegate.delete({ where: { id: sessionId } });
    } catch {
      // Session may not exist, ignore
    }
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.sessionDelegate.deleteMany({ where: { userId } });
  }

  async getSessionAndUser(
    sessionId: string,
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await this.sessionDelegate.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!result) return [null, null];

    const { user: userData, ...sessionData } = result;

    const session: DatabaseSession = {
      id: sessionData.id,
      userId: sessionData.userId,
      expiresAt: sessionData.expiresAt,
      attributes: {},
    };

    const user: DatabaseUser = {
      id: userData.id,
      attributes: { ...userData },
    };

    return [session, user];
  }

  async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const sessions = await this.sessionDelegate.findMany({
      where: { userId },
    });

    return sessions.map((s: any) => ({
      id: s.id,
      userId: s.userId,
      expiresAt: s.expiresAt,
      attributes: {},
    }));
  }

  async setSession(session: DatabaseSession): Promise<void> {
    await this.sessionDelegate.create({
      data: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    });
  }

  async updateSessionExpiration(
    sessionId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.sessionDelegate.update({
      where: { id: sessionId },
      data: { expiresAt },
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.sessionDelegate.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
  }
}
