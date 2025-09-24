import { LiveOrdersView } from "@/components/captain/live-orders-view";
import { orders } from "@/lib/data";
import { getMenuItems } from "@/services/get-menu";

export default async function CaptainDashboardPage() {
  const menuItems = await getMenuItems();
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Live Orders
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage incoming customer orders.
        </p>
      </header>
      <LiveOrdersView initialOrders={orders} menuItems={menuItems} />
    </div>
  );
}
