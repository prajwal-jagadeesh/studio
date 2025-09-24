"use client";

import { useState, useRef, useEffect } from "react";
import type { Table, Order } from "@/lib/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { KOTPreview } from "./kot-preview";
import { BillPreview } from "./bill-preview";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const statusStyles = {
  available: {
    bgColor: "bg-green-100 dark:bg-green-900",
    borderColor: "border-green-500",
    textColor: "text-green-800 dark:text-green-200",
  },
  occupied: {
    bgColor: "bg-yellow-100 dark:bg-yellow-900",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-800 dark:text-yellow-200",
  },
  billing: {
    bgColor: "bg-blue-100 dark:bg-blue-900",
    borderColor: "border-blue-500",
    textColor: "text-blue-800 dark:text-blue-200",
  },
};

export function TableGrid() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [printType, setPrintType] = useState<"kot" | "bill" | null>(null);
  const { toast } = useToast();

  const kotPrintRef = useRef<HTMLDivElement>(null);
  const billPrintRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/orders')
      ]);
      if (!tablesRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch data');
      }
      const tablesData = await tablesRes.json();
      const ordersData = await ordersRes.json();
      setTables(tablesData);
      setOrders(ordersData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch table or order data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll for updates every 5 seconds
    return () => clearInterval(interval);
  }, [toast]);

  const handleTableStatusChange = async (tableId: string, status: Table["status"]) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      await fetchData(); // Refetch data to ensure consistency
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update table status.",
      });
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      await fetchData(); // Refetch data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Order Update Failed",
        description: "Could not update order status.",
      });
    }
  };
  
  const handlePrint = (orderId: string, type: "kot" | "bill") => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (type === 'kot' && order.status === 'confirmed') {
      handleOrderStatusChange(order.id, 'preparing');
    }
    
    setOrderToPrint(order);
    setPrintType(type);
    
    setTimeout(() => {
      window.print();
      setOrderToPrint(null);
      setPrintType(null);
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="printable-content">
        {orderToPrint && (
          <>
            {printType === "kot" && (
              <div className="print-only">
                <KOTPreview order={orderToPrint} ref={kotPrintRef} />
              </div>
            )}
            {printType === "bill" && (
              <div className="print-only">
                <BillPreview order={orderToPrint} ref={billPrintRef} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="non-printable grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => {
          const currentOrder = orders.find(o => o.id === table.currentOrderId);
          return (
            <Card
              key={table.id}
              className={`transition-all flex flex-col ${
                statusStyles[table.status].bgColor
              } ${statusStyles[table.status].borderColor} border-2`}
            >
              <CardHeader>
                <CardTitle className={`font-headline ${statusStyles[table.status].textColor}`}>
                  {table.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className={`uppercase font-bold text-sm ${statusStyles[table.status].textColor}`}>
                  {table.status}
                </p>
                {table.status !== "available" && table.currentOrderId && (
                  <div>
                      <p className="text-xs text-muted-foreground mt-1">
                      Order: {table.currentOrderId}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                      Status: {currentOrder?.status}
                      </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-2">
                {table.currentOrderId && (table.status === 'occupied' || table.status === 'billing') && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handlePrint(table.currentOrderId!, "kot")}
                    >
                      Print KOT
                    </Button>
                    <Button size="sm" className="w-full" onClick={() => handlePrint(table.currentOrderId!, "bill")}>
                      Print Bill
                    </Button>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleTableStatusChange(table.id, "available")}
                    >
                      Available
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTableStatusChange(table.id, "occupied")}
                      disabled
                    >
                      Occupied
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleTableStatusChange(table.id, "billing")}
                    >
                      Billing
                    </DropdownMenuItem>
                    {currentOrder && currentOrder.status === 'preparing' && (
                       <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOrderStatusChange(currentOrder.id, 'ready')}>
                            Mark as Ready
                        </DropdownMenuItem>
                       </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </>
  );
}
