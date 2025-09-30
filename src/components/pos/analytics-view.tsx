
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { Order, MenuItem } from "@/lib/data";
import { DollarSign, ShoppingBag, BarChart as BarChartIcon, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { addDays, startOfDay } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemSalesSummary } from "./item-sales-summary";

interface AnalyticsViewProps {
  allOrders: Order[];
  menuItems: MenuItem[];
}

type DailyData = {
  date: string;
  totalOrders: number;
  revenue: number;
};

export function AnalyticsView({ allOrders, menuItems }: AnalyticsViewProps) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  });

  const handleDatePreset = (days: number) => {
    setRange({
      from: addDays(new Date(), -days + 1),
      to: new Date(),
    });
  };

  const filteredOrders = allOrders.filter(order => {
    // Only include billed or closed (paid) orders in analytics.
    if (order.status !== 'billed' && order.status !== 'closed') {
      return false;
    }
    const orderDate = startOfDay(new Date(order.createdAt));
    const from = range?.from ? startOfDay(range.from) : null;
    const to = range?.to ? startOfDay(range.to) : null;
    if (from && to) {
      return orderDate >= from && orderDate <= to;
    }
    if (from) {
      return orderDate >= from;
    }
    if (to) {
      return orderDate <= to;
    }
    return true;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const stats = {
    totalRevenue,
    totalOrders,
    avgOrderValue,
  };

  const chartData = filteredOrders.reduce((acc, order) => {
    const date = startOfDay(new Date(order.createdAt)).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, totalOrders: 0, revenue: 0 };
    }
    acc[date].totalOrders += 1;
    acc[date].revenue += order.total;
    return acc;
  }, {} as Record<string, DailyData>);

  const sortedChartData = Object.values(chartData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Date Range</h2>
            <Button variant="outline" size="sm" onClick={() => handleDatePreset(1)}>Today</Button>
            <Button variant="outline" size="sm" onClick={() => handleDatePreset(7)}>Last 7 Days</Button>
            <Button variant="outline" size="sm" onClick={() => handleDatePreset(30)}>Last 30 Days</Button>
            <DateRangePicker 
                range={range} 
                onRangeChange={setRange} 
                align="start"
                trigger={
                    <Button
                        id="date"
                        variant={"outline"}
                        className="w-[240px] justify-start text-left font-normal"
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Custom Range
                    </Button>
                }
            />
        </div>

        <Tabs defaultValue="sales-summary">
            <TabsList>
                <TabsTrigger value="sales-summary">Sales Summary</TabsTrigger>
                <TabsTrigger value="item-summary">Item-wise Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="sales-summary" className="space-y-6 mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                        ₹{stats.totalRevenue.toLocaleString()}
                        </div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                        {stats.totalOrders.toLocaleString()}
                        </div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                        ₹{stats.avgOrderValue.toFixed(2)}
                        </div>
                    </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                    <CardTitle>Daily Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={sortedChartData}>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                            contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            }}
                            labelClassName="font-bold"
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="item-summary" className="mt-4">
                <ItemSalesSummary orders={filteredOrders} menuItems={menuItems} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
