
"use client";

import { useRef } from "react";
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
import { useReactToPrint } from "react-to-print";
import { KOTPreview } from "./kot-preview";
import { BillPreview } from "./bill-preview";

interface PrintViewProps {
  orders: Order[];
}

function PrintRow({ order }: { order: Order }) {
  const kotPrintRef = useRef<HTMLDivElement>(null);
  const billPrintRef = useRef<HTMLDivElement>(null);

  const handlePrintKOT = useReactToPrint({
    content: () => kotPrintRef.current,
  });

  const handlePrintBill = useReactToPrint({
    content: () => billPrintRef.current,
  });

  return (
    <>
      {/* Hidden components for printing */}
      <div style={{ display: "none" }}>
        <KOTPreview order={order} ref={kotPrintRef} />
        <BillPreview order={order} ref={billPrintRef} />
      </div>
      <TableRow>
        <TableCell className="font-medium">{order.id}</TableCell>
        <TableCell>{order.tableName}</TableCell>
        <TableCell>₹{order.total.toFixed(2)}</TableCell>
        <TableCell>
          <Badge variant={order.status === "billed" ? "default" : "secondary"}>
            {order.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrintKOT}>
            Print KOT
          </Button>
          <Button size="sm" onClick={handlePrintBill}>
            Print Bill
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}

export function PrintView({ orders }: PrintViewProps) {
  return (
    <div className="border rounded-lg">
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
            <PrintRow key={order.id} order={order} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
