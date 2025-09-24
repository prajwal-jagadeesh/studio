import { LiveOrdersView } from "@/components/captain/live-orders-view";
import { orders, menuItems } from "@/lib/data";

export default function CaptainDashboardPage() {
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
