
"use client";

import { useState, useEffect } from "react";
import { AnalyticsView } from "@/components/pos/analytics-view";
import { orders as allOrders, menuItems } from "@/lib/data";
import type { Order, MenuItem } from "@/lib/data";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);
  
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
      <AnalyticsView allOrders={orders} menuItems={menuItems} isLoading={isLoading} />
    </div>
  );
}
