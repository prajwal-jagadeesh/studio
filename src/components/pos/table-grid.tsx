
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
import { Button } from "../ui/button";
import { KOTPreview } from "./kot-preview";
import { BillPreview } from "./bill-preview";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CookingPot, PlusCircle, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { notificationSound } from "@/lib/sounds";

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

const PRINT_WIDTH_KEY = "print-width-setting";
const DEFAULT_PRINT_WIDTH = "80mm";

export function TableGrid() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [printType, setPrintType] = useState<"kot" | "bill" | null>(null);
  const { toast } = useToast();

  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const kotPrintRef = useRef<HTMLDivElement>(null);
  const billPrintRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const previousOrderStatuses = useRef<Map<string, string>>(new Map());

  // Set print width from local storage on component mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(PRINT_WIDTH_KEY) || DEFAULT_PRINT_WIDTH;
    document.documentElement.style.setProperty('--print-width', savedWidth);
  }, []);

  const playSound = () => {
    audioRef.current?.play().catch(error => {
      console.error("Audio play failed:", error);
    });
  };

  const fetchData = async () => {
    if (isInitialLoad.current) {
        setIsLoading(true);
    }
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/orders')
      ]);
      if (!tablesRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch data');
      }
      const tablesData = await tablesRes.json();
      const ordersData: Order[] = await ordersRes.json();
      
      // Check for status changes to "ready"
      if (!isInitialLoad.current) {
        let shouldPlaySound = false;
        const newStatuses = new Map<string, string>();
        ordersData.forEach(order => {
          newStatuses.set(order.id, order.status);
          const oldStatus = previousOrderStatuses.current.get(order.id);
          if (oldStatus && oldStatus !== 'ready' && order.status === 'ready') {
            shouldPlaySound = true;
          }
        });
        if (shouldPlaySound) {
            playSound();
        }
        previousOrderStatuses.current = newStatuses;
      } else {
        const initialStatuses = new Map<string, string>();
        ordersData.forEach(order => initialStatuses.set(order.id, order.status));
        previousOrderStatuses.current = initialStatuses;
      }

      setTables(tablesData);
      setOrders(ordersData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch table or order data.",
      });
    } finally {
        if (isInitialLoad.current) {
            setIsLoading(false);
            isInitialLoad.current = false;
        }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderStatusChange = async (orderId: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      await fetchData();
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
    if (type === 'bill' && order.status === 'served') {
      handleOrderStatusChange(order.id, 'billed');
    }
    
    setOrderToPrint(order);
    setPrintType(type);
    
    setTimeout(() => {
      window.print();
      setOrderToPrint(null);
      setPrintType(null);
    }, 50);
  };
  
  const handleAddTable = async () => {
      if (!newTableName) {
          toast({ variant: "destructive", title: "Table name is required." });
          return;
      }
      setIsSubmitting(true);
      try {
          const response = await fetch('/api/tables', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newTableName }),
          });
          if (!response.ok) throw new Error('Failed to add table');
          toast({ title: "Success", description: "New table added successfully." });
          setNewTableName("");
          setIsAddTableDialogOpen(false);
          await fetchData();
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not add the table." });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeleteTable = async () => {
      if (!tableToDelete) return;
      setIsSubmitting(true);
      try {
          const response = await fetch(`/api/tables/${tableToDelete.id}`, {
              method: 'DELETE',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete table');
          }
          toast({ title: "Success", description: `Table "${tableToDelete.name}" deleted.` });
          setTableToDelete(null);
          await fetchData();
      } catch (error: any) {
          toast({ variant: "destructive", title: "Error", description: error.message });
      } finally {
          setIsSubmitting(false);
      }
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
      <audio ref={audioRef} src={notificationSound} preload="auto"></audio>
      <div className="printable-content">
        {orderToPrint && (
          <>
            {printType === "kot" && <KOTPreview order={orderToPrint} ref={kotPrintRef} />}
            {printType === "bill" && <BillPreview order={orderToPrint} ref={billPrintRef} />}
          </>
        )}
      </div>

      <div className="flex justify-end mb-4 non-printable">
          <Button onClick={() => setIsAddTableDialogOpen(true)}>
              <PlusCircle className="mr-2"/>
              Add Table
          </Button>
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
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className={`font-headline ${statusStyles[table.status].textColor}`}>
                  {table.name}
                </CardTitle>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        disabled={table.status !== 'available'}
                        onClick={() => setTableToDelete(table)}
                        className="text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Delete Table
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className={`uppercase font-bold text-sm ${statusStyles[table.status].textColor}`}>
                  {table.status}
                </p>
                {currentOrder && (
                  <div>
                      <p className="text-xs text-muted-foreground mt-1">
                      Order: {currentOrder.id}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                      Status: {currentOrder.status}
                      </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-2">
                {currentOrder && (
                  <>
                     {currentOrder.status === 'preparing' && (
                      <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleOrderStatusChange(currentOrder.id, 'ready')}
                      >
                          <CookingPot className="mr-2"/> Mark Ready
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handlePrint(currentOrder.id, "kot")}
                      disabled={currentOrder.status !== 'confirmed'}
                    >
                      Print KOT
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handlePrint(currentOrder.id, "bill")}
                      disabled={currentOrder.status !== 'served'}
                      >
                      Print Bill
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
      
      {/* Add Table Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Table</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="tableName">Table Name</Label>
                <Input 
                    id="tableName" 
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="e.g., Table 7"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddTable} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Add Table"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Table Confirmation */}
      <AlertDialog open={!!tableToDelete} onOpenChange={() => setTableToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the table "{tableToDelete?.name}". This action cannot be undone. You can only delete available tables.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTable} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Yes, delete table"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
