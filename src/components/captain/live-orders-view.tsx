"use client";

import { useState, useEffect } from "react";
import type { Order, MenuItem, Table } from "@/lib/data";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { MenuItemRecommender } from "./menu-item-recommender";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface LiveOrdersViewProps {
  initialOrders: Order[];
  menuItems: MenuItem[];
}

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-orange-500",
  preparing: "bg-blue-500",
  ready: "bg-green-500",
  served: "bg-purple-500",
  billed: "bg-gray-500",
  closed: "bg-gray-700",
};

export function LiveOrdersView({ initialOrders, menuItems }: LiveOrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.sort((a:Order, b:Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch orders.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll for new orders every 5 seconds
    return () => clearInterval(interval);
  }, [toast]);


  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
     try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedOrder = await response.json();
      setOrders(prevOrders =>
        prevOrders.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
      );

       // If an order is billed, update the table status to 'billing'
       if (status === 'billed') {
        await updateTableStatus(updatedOrder.tableId, 'billing');
      }

      // If an order is closed, update the table status to 'available'
      if (status === 'closed') {
        await updateTableStatus(updatedOrder.tableId, 'available');
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update order status.",
      });
    }
  };

  const updateTableStatus = async (tableId: string, status: Table["status"]) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update table status');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Table Update Failed",
        description: "Could not update the table status.",
      });
    }
  };
  
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  }

  const sortedOrders = [...orders].filter(o => o.status !== 'closed').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  <Badge variant="secondary" className="text-white capitalize" style={{ backgroundColor: `hsl(${statusColors[order.status].replace('bg-', '')})` }}>
                     <span className={`inline-block w-2 h-2 mr-2 rounded-full ${statusColors[order.status]}`}></span>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>
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
                      <DropdownMenuSeparator />
                       {order.status === 'pending' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, "confirmed")}>Confirm Order</DropdownMenuItem>
                       )}
                        {order.status === 'ready' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, "served")}>Mark as Served</DropdownMenuItem>
                       )}
                       {order.status === 'served' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, "billed")}>Mark as Billed</DropdownMenuItem>
                       )}
                       {order.status === 'billed' && (
                        <>
                          <DropdownMenuItem disabled>Payment Received</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "closed")}>Close Order</DropdownMenuItem>
                        </>
                       )}
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
