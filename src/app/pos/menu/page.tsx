import { MenuManagementView } from "@/components/pos/menu-management-view";
import { getMenuItems } from "@/services/get-menu";

export default async function MenuManagementPage() {
  const initialMenuItems = await getMenuItems();

  return (
    <div>
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">
            Menu Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, or remove menu items.
          </p>
        </div>
      </header>
      <MenuManagementView initialItems={initialMenuItems} />
    </div>
  );
}
