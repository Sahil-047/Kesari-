import ResourceManager from "@/components/admin/ResourceManager";
import { productsResource } from "@/lib/admin/resources";

export default function AdminProductsPage() {
  return (
    <ResourceManager
      config={productsResource}
      description="Name, category, description, details — then photos/video, then price and Buy now or Contact us."
    />
  );
}
