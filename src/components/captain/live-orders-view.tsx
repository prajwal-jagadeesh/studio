"use client";

import { useState } from "react";
import type { Order, MenuItem } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { MenuItemRecommender } from "./menu-item-recommender";
import { formatDistanceToNow } from 'date-fns';

interface LiveOrdersViewProps {
  initialOrders: Order[];
  menuItems: MenuItem[];
}

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-500",
  preparing: "bg-blue-500",
  ready: "bg-green-500",
  served: "bg-purple-500",
  billed: "bg-gray-500",
  closed: "bg-gray-700",
};

export function LiveOrdersView({ initialOrders, menuItems }: LiveOrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = (orderId: string, status: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };
  
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  }

  const sortedOrders = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.tableName}</TableCell>
                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-white" style={{ backgroundColor: `hsl(${statusColors[order.status].replace('bg-', '')})` }}>
                     <span className={`inline-block w-2 h-2 mr-2 rounded-full ${statusColors[order.status]}`}></span>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDistanceToNow(order.createdAt, { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openOrderDetails(order)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, "preparing")}>Mark as Preparing</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, "ready")}>Mark as Ready</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, "served")}>Mark as Served</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
         <DialogContent className="sm:max-w-2xl">
         <DialogHeader>
           <DialogTitle className="font-headline text-2xl text-primary">Order {selectedOrder.id} - {selectedOrder.tableName}</DialogTitle>
         </DialogHeader>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <ul>
                    {selectedOrder.items.map(item => (
                        <li key={item.menuId} className="flex justify-between">
                            <span>{item.name} x {item.qty}</span>
                            <span>₹{(item.price * item.qty).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
            </div>
            <div>
                <MenuItemRecommender order={selectedOrder} allMenuItems={menuItems} />
            </div>
         </div>
       </DialogContent>
      )}
    </Dialog>
  );
}
