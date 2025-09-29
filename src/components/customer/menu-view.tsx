
"use client";

import { useState, useEffect } from "react";
import type { MenuItem, OrderItem, Table, Order } from "@/lib/data";
import { MenuTabs } from "./menu-tabs";
import { OrderSummary } from "./order-summary";
import { OrderStatusView } from "./order-status-view";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";


interface MenuViewProps {
  menuItems: MenuItem[];
}

export function MenuView({ menuItems: initialMenuItems }: MenuViewProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);
  
  useEffect(() => {
    async function fetchMenuItems() {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
    }
    const menuInterval = setInterval(fetchMenuItems, 5000);
    return () => clearInterval(menuInterval);
  }, []);

  useEffect(() => {
    async function fetchTables() {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    }
    fetchTables();
    const tableInterval = setInterval(fetchTables, 5000);
    return () => clearInterval(tableInterval);
  }, []);


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

  const handleOrderPlaced = (order: Order) => {
    setPlacedOrder(order);
    setOrderItems([]); 
    setIsCartOpen(true);
    setIsAddingItems(false);
  };
  
  const handleOrderUpdated = (order: Order) => {
    setPlacedOrder(order);
    setOrderItems([]);
    setIsCartOpen(true);
    setIsAddingItems(false);
  };

  const handleAddNewItems = () => {
    setIsAddingItems(true);
    setIsCartOpen(true);
  };
  
  const handleBackToStatus = () => {
    setIsAddingItems(false);
    setOrderItems([]);
  }

  const handlePlaceNewOrder = () => {
    setPlacedOrder(null);
    setIsAddingItems(false);
    setIsCartOpen(false);
  }

  const totalItemsInCart = orderItems.reduce((acc, item) => acc + item.qty, 0);
  const showOrderStatus = !!placedOrder && !isAddingItems;


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Our Menu</h1>
        <p className="text-muted-foreground mt-2">
          Explore our delicious multi-cuisine vegetarian dishes.
        </p>
      </header>
      
      <MenuTabs menuItems={menuItems.filter(item => item.available)} onAddToOrder={addToOrder} />
      
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
            size="icon"
          >
            <ShoppingCart className="h-8 w-8" />
            {(totalItemsInCart > 0 && !placedOrder) && (
              <Badge className="absolute -top-2 -right-2">
                {totalItemsInCart}
              </Badge>
            )}
            {placedOrder && (
                 <Badge variant="destructive" className="absolute -top-2 -right-2 animate-pulse">!</Badge>
            )}
            <span className="sr-only">Open Cart</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-headline text-2xl text-primary">
              {showOrderStatus ? "Order Status" : (isAddingItems ? "Add Items" : "Your Order")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            {showOrderStatus ? (
              <OrderStatusView 
                order={placedOrder} 
                onPlaceNewOrder={handlePlaceNewOrder}
                onAddNewItems={handleAddNewItems}
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
                onBackToStatus={placedOrder ? handleBackToStatus : undefined}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
