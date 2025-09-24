"use client";

import type { OrderItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface OrderSummaryProps {
  items: OrderItem[];
  onUpdateQuantity: (menuId: string, quantity: number) => void;
  onClearOrder: () => void;
}

export function OrderSummary({ items, onUpdateQuantity, onClearOrder }: OrderSummaryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePlaceOrder = () => {
    // In a real app, this would send the order to Firestore.
    console.log("Placing order:", items);
    onClearOrder();
    setIsDialogOpen(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ShoppingCart className="h-6 w-6 text-primary" />
          Your Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.menuId} className="flex items-center gap-4">
                <div className="flex-grow">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">₹{item.price}</p>
                </div>
                <Input
                  type="number"
                  value={item.qty}
                  onChange={(e) => onUpdateQuantity(item.menuId, parseInt(e.target.value))}
                  className="w-16 h-8 text-center"
                  min="0"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="flex flex-col gap-4">
          <Separator />
          <div className="w-full flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="lg">Place Order</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Your order for a total of ₹{total} will be placed. Are you sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Review Order</AlertDialogCancel>
                <AlertDialogAction onClick={handlePlaceOrder}>Confirm & Place</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" className="w-full" onClick={onClearOrder}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Order
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
