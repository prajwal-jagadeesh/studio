
"use client";

import { useState, useEffect } from "react";
import type { Order, MenuItem } from "@/lib/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle, Bell, Loader2,ThumbsUp, Ban, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";

interface OrderStatusViewProps {
  order: Order;
  onPlaceNewOrder: () => void;
  onAddNewItems: () => void;
}

const statusInfo: Record<
  Order["status"],
  { text: string; icon: React.ElementType; color: string }
> = {
  pending: {
    text: "Pending Confirmation",
    icon: Clock,
    color: "bg-yellow-500",
  },
  confirmed: {
    text: "Order Confirmed",
    icon: ThumbsUp,
    color: "bg-orange-500",
  },
  preparing: {
    text: "Preparing Your Meal",
    icon: ChefHat,
    color: "bg-blue-500",
  },
  ready: { text: "Ready for Pickup", icon: Bell, color: "bg-green-500" },
  served: {
    text: "Order Served",
    icon: CheckCircle,
    color: "bg-purple-500",
  },
  billed: { text: "Billed", icon: CheckCircle, color: "bg-gray-500" },
  closed: { text: "Closed", icon: CheckCircle, color: "bg-gray-700" },
  cancelled: { text: "Order Cancelled", icon: Ban, color: "bg-red-600" },
};

export function OrderStatusView({
  order: initialOrder,
  onPlaceNewOrder,
  onAddNewItems,
}: OrderStatusViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    if (order.status === 'closed' || order.status === 'cancelled') {
        // After 5 seconds, allow placing a new order.
        setTimeout(() => {
            onPlaceNewOrder();
        }, 5000);
        return;
    }
    
    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/orders/${order.id}`);
        if (response.ok) {
          const data: Order = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Failed to fetch order status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [order.id, order.status, onPlaceNewOrder]);

  const currentStatus = statusInfo[order.status];
  const StatusIcon = currentStatus.icon;
  
  const canAddItems = order.status !== 'billed' && order.status !== 'closed' && order.status !== 'cancelled';


  return (
    <div className="pt-4 flex flex-col h-full">
      <div className="flex-grow space-y-4">
        <div className="flex items-center justify-between font-headline">
          <span>Order #{order.id} for {order.tableName}</span>
           {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
        <div>
          <h4 className="font-semibold mb-2">Status</h4>
          <Badge
            variant="secondary"
            className="text-white text-sm w-full justify-center capitalize"
            style={{ backgroundColor: `hsl(${currentStatus.color.replace('bg-', '')})` }}
          >
            <StatusIcon className="mr-2 h-4 w-4" />
            {currentStatus.text}
          </Badge>
        </div>
        <Separator />
        <div>
            <h4 className="font-semibold mb-2">Items</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {order.items.map((item) => (
                    <div key={item.menuId} className="flex justify-between text-sm">
                        <span>{item.name} x {item.qty}</span>
                        <span>₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
        
      </div>
      <div className="mt-auto space-y-2 pt-4">
         <Separator />
         <div className="w-full flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{order.total.toFixed(2)}</span>
        </div>
        {canAddItems && (
            <Button 
                className="w-full"
                onClick={onAddNewItems}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add More Items
            </Button>
        )}
        <Button 
            className="w-full"
            onClick={onPlaceNewOrder}
            variant="outline"
        >
            Place a New Order
        </Button>
      </div>
    </div>
  );
}
