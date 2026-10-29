
import ResourceManager from "@/components/admin/ResourceManager";
import { collectionsResource } from "@/lib/admin/resources";

export default function AdminCollectionsPage() {
  return <ResourceManager config={collectionsResource} />;
}
