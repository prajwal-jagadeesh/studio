"use client";

import { useState, useRef } from "react";
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
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { KOTPreview } from "./kot-preview";
import { BillPreview } from "./bill-preview";

interface TableGridProps {
  initialTables: Table[];
  initialOrders: Order[];
}

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

export function TableGrid({ initialTables, initialOrders }: TableGridProps) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [printType, setPrintType] = useState<"kot" | "bill" | null>(null);

  const kotPrintRef = useRef<HTMLDivElement>(null);
  const billPrintRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = (tableId: string, status: Table["status"]) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId ? { ...table, status } : table
      )
    );
  };
  
  const handlePrint = (orderId: string, type: "kot" | "bill") => {
    const order = initialOrders.find(o => o.id === orderId);
    if (!order) return;
    
    setOrderToPrint(order);
    setPrintType(type);
    
    setTimeout(() => {
      window.print();
      setOrderToPrint(null);
      setPrintType(null);
    }, 50);
  };

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
        {tables.map((table) => (
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
                <p className="text-xs text-muted-foreground mt-1">
                  Order: {table.currentOrderId}
                </p>
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
                    onClick={() => handleStatusChange(table.id, "available")}
                  >
                    Available
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(table.id, "occupied")}
                  >
                    Occupied
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(table.id, "billing")}
                  >
                    Billing
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
