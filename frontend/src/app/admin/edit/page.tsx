
import ResourceManager from "@/components/admin/ResourceManager";
import { editResource } from "@/lib/admin/resources";

export default function AdminEditPage() {
  return <ResourceManager config={editResource} />;
}
