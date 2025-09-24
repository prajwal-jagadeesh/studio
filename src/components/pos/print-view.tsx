"use client";

import { useState, useRef } from "react";
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
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import { KOTPreview } from "./kot-preview";
import { BillPreview } from "./bill-preview";

interface PrintViewProps {
  orders: Order[];
}

export function PrintView({ orders }: PrintViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogType, setDialogType] = useState<"KOT" | "Bill" | null>(null);

  const kotPrintRef = useRef<HTMLDivElement>(null);
  const billPrintRef = useRef<HTMLDivElement>(null);
  
  const handlePrintKOT = useReactToPrint({
    content: () => kotPrintRef.current,
  });

  const handlePrintBill = useReactToPrint({
    content: () => billPrintRef.current,
  });

  const openDialog = (order: Order, type: "KOT" | "Bill") => {
    setSelectedOrder(order);
    setDialogType(type);
  };
  
  const closeDialog = () => {
    setSelectedOrder(null);
    setDialogType(null);
  }

  return (
    <>
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
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.tableName}</TableCell>
                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'billed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(order, 'KOT')}>Print KOT</Button>
                  <Button size="sm" onClick={() => openDialog(order, 'Bill')}>Print Bill</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!dialogType} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {dialogType} for Order {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedOrder && dialogType === "KOT" && <KOTPreview order={selectedOrder} ref={kotPrintRef} />}
            {selectedOrder && dialogType === "Bill" && <BillPreview order={selectedOrder} ref={billPrintRef} />}
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={dialogType === 'KOT' ? handlePrintKOT : handlePrintBill}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
