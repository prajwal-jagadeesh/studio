"use client";

import { useState } from "react";
import type { MenuItem, OrderItem } from "@/lib/data";
import { MenuTabs } from "./menu-tabs";
import { OrderSummary } from "./order-summary";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface MenuViewProps {
  menuItems: MenuItem[];
}

export function MenuView({ menuItems }: MenuViewProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

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

  return (
    <div className="container mx-auto px-4 py-8">
       <Button variant="ghost" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Our Menu</h1>
        <p className="text-muted-foreground mt-2">
          Explore our delicious multi-cuisine vegetarian dishes.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <MenuTabs menuItems={menuItems} onAddToOrder={addToOrder} />
        </div>
        <div className="lg:col-span-1 sticky top-8">
          <OrderSummary
            items={orderItems}
            onUpdateQuantity={updateQuantity}
            onClearOrder={clearOrder}
          />
        </div>
      </div>
    </div>
  );
}
