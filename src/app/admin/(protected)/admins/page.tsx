import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth.server";
import { AdminManagementClient } from "@/components/admin/AdminManagementClient";

export default async function AdminsPage() {
  const { user } = await validateRequest();

  // If not logged in, they wouldn't hit this due to layout.tsx, but just for type safety
  if (!user) {
    redirect("/admin/login");
  }

  // Only SUPER_ADMIN can access this page
  if (user.role !== "SUPER_ADMIN") {
    redirect("/admin/stories");
  }

  return (
    <div className="w-full">
      <AdminManagementClient currentUserId={user.id} />
    </div>
  );
}
