"use client";

import { useRef, useState } from "react";
import type { Order } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KOTPreview } from "./kot-preview";
import { BillPreview } from "./bill-preview";

interface PrintViewProps {
  orders: Order[];
}

export function PrintView({ orders }: PrintViewProps) {
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [printType, setPrintType] = useState<"kot" | "bill" | null>(null);

  const kotPrintRef = useRef<HTMLDivElement>(null);
  const billPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = (order: Order, type: "kot" | "bill") => {
    setOrderToPrint(order);
    setPrintType(type);
    // The timeout ensures the state is updated and the correct preview is rendered
    // before window.print() is called.
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

      <div className="non-printable border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.tableName}</TableCell>
                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "billed" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(order, "kot")}
                  >
                    Print KOT
                  </Button>
                  <Button size="sm" onClick={() => handlePrint(order, "bill")}>
                    Print Bill
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
