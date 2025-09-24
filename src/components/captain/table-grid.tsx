"use client";

import { useState } from "react";
import type { Table } from "@/lib/data";
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

interface TableGridProps {
  initialTables: Table[];
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

export function TableGrid({ initialTables }: TableGridProps) {
  const [tables, setTables] = useState<Table[]>(initialTables);

  const handleStatusChange = (tableId: string, status: Table["status"]) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId ? { ...table, status } : table
      )
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {tables.map((table) => (
        <Card
          key={table.id}
          className={`transition-all ${
            statusStyles[table.status].bgColor
          } ${statusStyles[table.status].borderColor} border-2`}
        >
          <CardHeader>
            <CardTitle className={`font-headline ${statusStyles[table.status].textColor}`}>
              {table.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`uppercase font-bold text-sm ${statusStyles[table.status].textColor}`}>
              {table.status}
            </p>
            {table.status !== "available" && (
              <p className="text-xs text-muted-foreground mt-1">
                Order: {table.currentOrderId}
              </p>
            )}
          </CardContent>
          <CardFooter>
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
  );
}
