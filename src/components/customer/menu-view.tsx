
"use client";

import { useState, useEffect } from "react";
import type { MenuItem, OrderItem, Table, Order } from "@/lib/data";
import { MenuTabs } from "./menu-tabs";
import { OrderSummary } from "./order-summary";
import { getTables } from "@/services/get-tables";
import { OrderStatusView } from "./order-status-view";


interface MenuViewProps {
  menuItems: MenuItem[];
}

export function MenuView({ menuItems: initialMenuItems }: MenuViewProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [viewMode, setViewMode] = useState<'order-summary' | 'order-status'>('order-summary');
  
  useEffect(() => {
    async function fetchMenuItems() {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
    }
    const interval = setInterval(fetchMenuItems, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchTables() {
      const fetchedTables = await getTables();
      setTables(fetchedTables);
    }
    fetchTables();
  }, []);

  useEffect(() => {
    if (placedOrder && orderItems.length === 0) {
      setViewMode('order-status');
    } else if (!placedOrder) {
      setViewMode('order-summary');
    }
  }, [placedOrder, orderItems]);

  const addToOrder = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((oi) => oi.menuId === item.id);
      if (existingItem) {
        return prevItems.map((oi) =>
          oi.menuId === item.id ? { ...oi, qty: oi.qty + 1 } : oi
        );
      }
      return [
        ...prevItems,
        { menuId: item.id, name: item.name, qty: 1, price: item.price },
      ];
    });
    setViewMode('order-summary');
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prevItems) =>
        prevItems.filter((item) => item.menuId !== menuId)
      );
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((item) =>
          item.menuId === menuId ? { ...item, qty: quantity } : item
        )
      );
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const handleOrderPlaced = (order: Order) => {
    setPlacedOrder(order);
    setOrderItems([]); 
    setViewMode('order-status');
  };
  
  const handleOrderUpdated = (order: Order) => {
    setPlacedOrder(order);
    setOrderItems([]);
    setViewMode('order-status');
  };

  const handlePlaceNewOrder = () => {
    setPlacedOrder(null);
    setViewMode('order-summary');
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Our Menu</h1>
        <p className="text-muted-foreground mt-2">
          Explore our delicious multi-cuisine vegetarian dishes.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <MenuTabs menuItems={menuItems.filter(item => item.available)} onAddToOrder={addToOrder} />
        </div>
        <div className="lg:col-span-1 sticky top-8">
          {viewMode === 'order-status' && placedOrder ? (
            <OrderStatusView 
              order={placedOrder} 
              onPlaceNewOrder={handlePlaceNewOrder}
            />
          ) : (
             <OrderSummary
              items={orderItems}
              tables={tables}
              onUpdateQuantity={updateQuantity}
              onClearOrder={clearOrder}
              onOrderPlaced={handleOrderPlaced}
              onOrderUpdated={handleOrderUpdated}
              activeOrder={placedOrder}
            />
          )}
        </div>
      </div>
    </div>
  );
}
