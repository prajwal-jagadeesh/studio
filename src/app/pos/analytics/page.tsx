
import { AnalyticsView } from "@/components/pos/analytics-view";
import { orders as allOrders, menuItems } from "@/lib/data";
import type { Order, MenuItem } from "@/lib/data";

async function getOrders(): Promise<Order[]> {
    // In a real app, this would be a database call.
    // For now, we simulate an API call to our in-memory data.
    return Promise.resolve(allOrders);
}

export default async function AnalyticsPage() {
  const orders = await getOrders();
  
  return (
     <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Review your restaurant's performance metrics.
        </p>
      </header>
      {/* Pass server-fetched data directly to the client component */}
      <AnalyticsView allOrders={orders} menuItems={menuItems} />
    </div>
  );
}
