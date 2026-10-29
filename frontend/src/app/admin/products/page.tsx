
import ResourceManager from "@/components/admin/ResourceManager";
import { productsResource } from "@/lib/admin/resources";

export default function AdminProductsPage() {
  return <ResourceManager config={productsResource} />;
}
