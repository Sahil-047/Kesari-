
import ResourceManager from "@/components/admin/ResourceManager";
import { usersResource } from "@/lib/admin/resources";

export default function AdminUsersPage() {
  return <ResourceManager config={usersResource} />;
}
