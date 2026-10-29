
import ResourceManager from "@/components/admin/ResourceManager";
import { enquiriesResource } from "@/lib/admin/resources";

export default function AdminEnquiriesPage() {
  return <ResourceManager config={enquiriesResource} />;
}
