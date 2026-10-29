
import ResourceManager from "@/components/admin/ResourceManager";
import { craftsResource } from "@/lib/admin/resources";

export default function AdminCraftsPage() {
  return <ResourceManager config={craftsResource} />;
}
