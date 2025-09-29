
"use client";

import type { Order, MenuItem } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ItemSalesSummaryProps {
    orders: Order[];
    menuItems: MenuItem[];
}

type ItemSummary = {
    id: string;
    name: string;
    category: string;
    qtySold: number;
    revenue: number;
};

export function ItemSalesSummary({ orders, menuItems }: ItemSalesSummaryProps) {
    const summaryData: Record<string, ItemSummary> = menuItems.reduce((acc, item) => {
        acc[item.id] = {
            id: item.id,
            name: item.name,
            category: item.category,
            qtySold: 0,
            revenue: 0,
        };
        return acc;
    }, {} as Record<string, ItemSummary>);


    orders.forEach(order => {
        order.items.forEach(item => {
            if (summaryData[item.menuId]) {
                summaryData[item.menuId].qtySold += item.qty;
                summaryData[item.menuId].revenue += item.qty * item.price;
            }
        });
    });

    const sortedSummary = Object.values(summaryData)
        .filter(item => item.qtySold > 0)
        .sort((a, b) => b.revenue - a.revenue);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Item-wise Sales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Category</TableHead>
                                <TableHead className="text-right">Quantity Sold</TableHead>
                                <TableHead className="text-right">Total Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSummary.length > 0 ? sortedSummary.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{item.category}</TableCell>
                                    <TableCell className="text-right">{item.qtySold}</TableCell>
                                    <TableCell className="text-right">₹{item.revenue.toFixed(2)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No sales data for the selected period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
