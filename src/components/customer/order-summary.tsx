
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
  onOrderUpdated: (order: Order) => void;
  activeOrder: Order | null;
}

export function OrderSummary({
  items,
  tables,
  onUpdateQuantity,
  onClearOrder,
  onOrderPlaced,
  onOrderUpdated,
  activeOrder
}: OrderSummaryProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Order Placed Successfully!");
  const [updatedOrderDetails, setUpdatedOrderDetails] = useState<Order | null>(null);
  const { toast } = useToast();

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePlaceOrUpdateOrder = async () => {
    setIsLoading(true);

    if (activeOrder) {
      // Update existing order
      try {
        const response = await fetch(`/api/orders/${activeOrder.id}/add-items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add items to order");
        }
        
        const updatedOrder = await response.json();
        setUpdatedOrderDetails(updatedOrder);
        setSuccessMessage("Items Added Successfully!");
        setIsSuccessOpen(true);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message || "Could not add items to your order.",
        });
      } finally {
        setIsLoading(false);
      }

    } else {
      // Place new order
      if (!selectedTableId) {
        toast({
          variant: "destructive",
          title: "No Table Selected",
          description: "Please select a table before placing an order.",
        });
        setIsLoading(false);
        return;
      }
      try {
        const selectedTable = tables.find((t) => t.id === selectedTableId);
        if (!selectedTable) throw new Error("Selected table not found");
        
        const orderDetails = {
          tableId: selectedTable.id,
          tableName: selectedTable.name,
        };

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderDetails, items: items }),
        });

        if (!response.ok) throw new Error("Failed to place order");
        
        const newOrder = await response.json();
        setUpdatedOrderDetails(newOrder);
        setSuccessMessage("Order Placed Successfully!");
        setIsSuccessOpen(true);

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Order Failed",
          description: "Could not place your order. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuccessDialogClose = () => {
    setIsSuccessOpen(false);
    if(updatedOrderDetails) {
        if(activeOrder) {
            onOrderUpdated(updatedOrderDetails);
        } else {
            onOrderPlaced(updatedOrderDetails);
        }
    }
    setSelectedTableId(null);
  }
  
  const isTableSelectionDisabled = !!activeOrder;

  const renderPlaceOrderButton = () => {
    if (activeOrder) {
      return (
        <Button
          className="w-full"
          size="lg"
          onClick={handlePlaceOrUpdateOrder}
          disabled={isLoading || items.length === 0}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Add to Order"}
        </Button>
      );
    }

    // This is a new order, so we show the confirmation dialog.
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full"
            size="lg"
            disabled={isLoading || !selectedTableId || items.length === 0}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Place Order"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
            <AlertDialogDescription>
              This will place an order for table {tables.find(t => t.id === selectedTableId)?.name} with a total of ₹{total.toFixed(2)}. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto text-sm">
            {items.map((item) => (
              <div key={item.menuId} className="flex justify-between py-1">
                <span>
                  {item.name} x {item.qty}
                </span>
                <span>₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Order</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlaceOrUpdateOrder}>
              Confirm & Place
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };


  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <ShoppingCart className="h-6 w-6 text-primary" />
            {activeOrder ? `Adding to Order #${activeOrder.id}`: "Your Order"}
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
                  value={activeOrder ? activeOrder.tableId : (selectedTableId ?? "")}
                  onValueChange={setSelectedTableId}
                  disabled={isTableSelectionDisabled}
                >
                  <SelectTrigger id="table-select">
                    <SelectValue placeholder="Choose a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {isTableSelectionDisabled && activeOrder ? (
                        <SelectItem key={activeOrder.tableId} value={activeOrder.tableId}>
                            {activeOrder.tableName}
                        </SelectItem>
                    ) : (
                        tables
                        .filter((t) => t.status === "available")
                        .map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                            {table.name}
                            </SelectItem>
                        ))
                    )}
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
            {renderPlaceOrderButton()}
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
            <AlertDialogTitle>{successMessage}</AlertDialogTitle>
            <AlertDialogDescription>
              You can now track the updated order status.
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
