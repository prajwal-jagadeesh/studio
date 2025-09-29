
"use client";

import { useState, useEffect, useRef } from "react";
import type { Order, MenuItem, Table as TableType, OrderItem } from "@/lib/data";
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
  DialogClose,
} from "@/components/ui/dialog";
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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2, PlusCircle, X } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { MenuTabs } from "../customer/menu-tabs";
import { OrderSummary } from "../customer/order-summary";
import { notificationSound } from "@/lib/sounds";


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
  cancelled: "bg-red-600",
};

export function LiveOrdersView({ initialOrders, menuItems }: LiveOrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [tables, setTables] = useState<TableType[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const previousOrderIds = useRef(new Set(initialOrders.map(o => o.id)));


  const { toast } = useToast();

  const playSound = () => {
    audioRef.current?.play().catch(error => {
        console.error("Audio play failed:", error);
    });
  };

  const fetchAllData = async () => {
      try {
        const [ordersRes, tablesRes] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/tables')
        ]);
        if (!ordersRes.ok || !tablesRes.ok) {
          throw new Error('Failed to fetch data');
        }
        const ordersData = await ordersRes.json();
        const tablesData = await tablesRes.json();
        
        const newOrderIds = new Set(ordersData.map((o: Order) => o.id));
        const hasNewOrder = ordersData.some((o: Order) => !previousOrderIds.current.has(o.id) && o.status === 'pending');
        
        if (hasNewOrder && !isLoading) {
          playSound();
        }

        previousOrderIds.current = newOrderIds;

        setOrders(ordersData.sort((a:Order, b:Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setTables(tablesData);
        
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch data.",
        });
      } finally {
        setIsLoading(false);
      }
    };


  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000); // Poll for new data every 5 seconds
    return () => clearInterval(interval);
  }, []);


  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
     try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedOrder: Order = await response.json();
      
      if (status === 'closed' || status === 'cancelled') {
        await fetch(`/api/tables/${updatedOrder.tableId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'available' }),
        });
      }
      
      fetchAllData();

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update order status.",
      });
    }
  };
  
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  }

  // --- New Order Logic ---
  const addToOrder = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((oi) => oi.menuId === item.id);
      if (existingItem) {
        return prevItems.map((oi) =>
          oi.menuId === item.id ? { ...oi, qty: oi.qty + 1 } : oi
        );
      }
      return [...prevItems, { menuId: item.id, name: item.name, qty: 1, price: item.price }];
    });
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prevItems) => prevItems.filter((item) => item.menuId !== menuId));
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((item) => (item.menuId === menuId ? { ...item, qty: quantity } : item))
      );
    }
  };

  const clearOrder = () => setOrderItems([]);

  const handleOrderPlaced = (order: Order) => {
    setPlacedOrder(order); // We don't really need this in captain view
    setOrderItems([]); 
    setIsNewOrderDialogOpen(false);
    fetchAllData(); // Refresh orders list
  };

  const handleOrderUpdated = (order: Order) => {
    setPlacedOrder(order);
    setOrderItems([]);
    setIsNewOrderDialogOpen(false);
    fetchAllData();
  };

  const sortedOrders = [...orders].filter(o => o.status !== 'closed' && o.status !== 'cancelled').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <audio ref={audioRef} src={notificationSound} preload="auto"></audio>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsNewOrderDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead className="hidden sm:table-cell">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.tableName}</TableCell>
                <TableCell className="hidden sm:table-cell">₹{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-white capitalize" style={{ backgroundColor: `hsl(${statusColors[order.status].replace('bg-', '')})` }}>
                     <span className={`inline-block w-2 h-2 mr-2 rounded-full ${statusColors[order.status]}`}></span>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>
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
                       {order.status === 'billed' && (
                        <>
                          <DropdownMenuItem onClick={() => toast({ title: "Payment Received", description: "You can now close the order." })}>Payment Received</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "closed")}>Close Order</DropdownMenuItem>
                        </>
                       )}
                       <DropdownMenuSeparator />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="focus:bg-destructive/10 text-red-600 dark:text-red-500"
                              onSelect={(e) => e.preventDefault()}
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will cancel the order and mark the table as available. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Go Back</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleStatusChange(order.id, "cancelled")}
                              >
                                Yes, Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        {selectedOrder && (
            <DialogContent className="sm:max-w-lg">
            <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Order {selectedOrder.id} - {selectedOrder.tableName}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
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
        </DialogContent>
        )}
    </Dialog>

    <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="h-screen w-screen max-w-full flex flex-col p-0 gap-0">
            <DialogHeader className="p-4 border-b">
                <DialogTitle className="font-headline text-2xl text-primary">Place a New Order</DialogTitle>
                 <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="absolute right-4 top-3">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogClose>
            </DialogHeader>
            <div className="flex-1 grid md:grid-cols-[2fr_1fr] overflow-hidden">
                <div className="p-6 overflow-y-auto">
                     <MenuTabs menuItems={menuItems.filter(item => item.available)} onAddToOrder={addToOrder} />
                </div>
                <div className="p-6 border-l flex flex-col bg-muted/20">
                     <h3 className="text-xl font-headline text-primary mb-4">Order Summary</h3>
                     <OrderSummary
                        items={orderItems}
                        tables={tables}
                        onUpdateQuantity={updateQuantity}
                        onClearOrder={clearOrder}
                        onOrderPlaced={handleOrderPlaced}
                        onOrderUpdated={handleOrderUpdated}
                        activeOrder={null}
                    />
                </div>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
