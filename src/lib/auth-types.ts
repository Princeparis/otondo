export interface DatabaseUserAttributes {
  email: string;
  name: string;
  avatarUrl?: string | null;
  role?: string; // Optional for public users, present for admins
  isActive?: boolean;
}
