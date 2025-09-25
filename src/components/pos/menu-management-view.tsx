"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { MenuItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "../ui/checkbox";

interface MenuManagementViewProps {
  initialItems: MenuItem[];
}

const menuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  category: z.enum(["Starters", "Main Course", "Breads", "Desserts", "Beverages"]),
});

type MenuFormValues = z.infer<typeof menuSchema>;

export function MenuManagementView({ initialItems }: MenuManagementViewProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [updatingItems, setUpdatingItems] = useState<string[]>([]);
  const { toast } = useToast();

  const categories: MenuItem['category'][] = [
    "Starters",
    "Main Course",
    "Breads",
    "Desserts",
    "Beverages",
  ];

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Starters",
    },
  });

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/menu");
      if (!response.ok) throw new Error("Failed to fetch menu items.");
      const data = await response.json();
      setItems(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleOpenDialog = (item: MenuItem | null) => {
    setEditingItem(item);
    if (item) {
      form.reset(item);
    } else {
      form.reset({ name: "", description: "", price: 0, category: "Starters" });
    }
    setIsDialogOpen(true);
  };
  
  const handleAvailabilityChange = async (itemId: string, available: boolean) => {
    setUpdatingItems(prev => [...prev, itemId]);
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available }),
      });
      if (!response.ok) throw new Error("Failed to update availability.");
      
      const updatedItem = await response.json();
      setItems(prevItems => prevItems.map(item => item.id === itemId ? updatedItem : item));
      
      toast({
        title: "Success",
        description: `"${updatedItem.name}" status updated.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
      // Revert UI on failure if needed, for now we just show a toast
    } finally {
        setUpdatingItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const onSubmit = async (data: MenuFormValues) => {
    const url = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu";
    const method = editingItem ? "PATCH" : "POST";

    // For edits, we use the existing availability status. For new items, default to true.
    const payload = editingItem 
      ? { ...data, available: editingItem.available }
      : { ...data, available: true };


    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingItem ? 'update' : 'create'} item.`);
      }

      toast({
        title: "Success!",
        description: `Menu item has been successfully ${editingItem ? 'updated' : 'created'}.`,
      });

      await fetchItems();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Operation Failed", description: error.message });
    }
  };
  
  const handleDelete = async (itemId: string) => {
    try {
        const response = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete item.');
        }
        toast({ title: "Success!", description: "Menu item deleted." });
        await fetchItems();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    }
  };


  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2" />
          Add Menu Item
        </Button>
      </div>

      <Tabs defaultValue="Starters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((category) => (
                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
        </TabsList>
        {categories.map((category) => (
            <TabsContent key={category} value={category}>
                <div className="border rounded-lg mt-4">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.filter(item => item.category === category).map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    {updatingItems.includes(item.id) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Checkbox
                                            id={`available-${item.id}`}
                                            checked={item.available}
                                            onCheckedChange={(checked) => handleAvailabilityChange(item.id, !!checked)}
                                        />
                                    )}
                                    <label
                                        htmlFor={`available-${item.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {item.available ? "Available" : "Unavailable"}
                                    </label>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the menu item.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                                        Continue
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
            </TabsContent>
        ))}

      </Tabs>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Paneer Butter Masala" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short description of the dish." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 350" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {editingItem ? "Save Changes" : "Create Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
