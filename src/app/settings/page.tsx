import { validateUserRequest } from "@/lib/userAuth.server";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const { user } = await validateUserRequest();

  if (!user || !user.email) {
    redirect("/login");
  }

  // Ensure email is passed down securely (validateUserRequest returns email but we must typecheck it here)
  const userData = {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };

  return <SettingsClient user={userData} />;
}
