
"use client";

import type { OrderItem, Table, Order } from "@/lib/data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Trash2, CheckCircle, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";

interface OrderSummaryProps {
  items: OrderItem[];
  tables: Table[];
  onUpdateQuantity: (menuId: string, quantity: number) => void;
  onClearOrder: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function OrderSummary({
  items,
  tables,
  onUpdateQuantity,
  onClearOrder,
  onOrderPlaced,
}: OrderSummaryProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<Order | null>(null);
  const { toast } = useToast();

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePlaceOrder = async () => {
    if (!selectedTableId) {
      toast({
        variant: "destructive",
        title: "No Table Selected",
        description: "Please select a table before placing an order.",
      });
      setIsConfirmOpen(false);
      return;
    }
    setIsLoading(true);
    setIsConfirmOpen(false);

    try {
      const selectedTable = tables.find((t) => t.id === selectedTableId);
      if (!selectedTable) throw new Error("Selected table not found");
      
      const orderDetails = {
        tableId: selectedTable.id,
        tableName: selectedTable.name,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...orderDetails,
          items: items,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }
      
      const newOrder = await response.json();
      setPlacedOrderDetails(newOrder);
      setIsSuccessOpen(true);
      // We no longer clear the order here; we lift the state up.

    } catch (error) {
      console.error("Order placement failed:", error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description:
          "Could not place your order at this time. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setIsSuccessOpen(false);
    if(placedOrderDetails) {
      onOrderPlaced(placedOrderDetails);
    }
    setSelectedTableId(null);
  }

  return (
    <>
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
            <>
              <div className="space-y-2 mb-4">
                <Label htmlFor="table-select">Select Table</Label>
                <Select
                  value={selectedTableId ?? ""}
                  onValueChange={setSelectedTableId}
                >
                  <SelectTrigger id="table-select">
                    <SelectValue placeholder="Choose a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .filter((t) => t.status === "available")
                      .map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.menuId} className="flex items-center gap-4">
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price}
                      </p>
                    </div>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        onUpdateQuantity(item.menuId, parseInt(e.target.value))
                      }
                      className="w-16 h-8 text-center"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
        {items.length > 0 && (
          <CardFooter className="flex flex-col gap-4">
            <Separator />
            <div className="w-full flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={isLoading || !selectedTableId}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your order for a total of ₹{total.toFixed(2)} will be
                    placed for table{" "}
                    {tables.find((t) => t.id === selectedTableId)?.name}. Are
                    you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-60 overflow-y-auto text-sm">
                  {items.map((item) => (
                    <div
                      key={item.menuId}
                      className="flex justify-between py-1"
                    >
                      <span>
                        {item.name} x {item.qty}
                      </span>
                      <span>₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Review Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePlaceOrder}>
                    Confirm & Place
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              className="w-full"
              onClick={onClearOrder}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Order
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <AlertDialogTitle>Order Placed Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your order has been sent to the kitchen. You can now track its status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessDialogClose}>
              Track Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
