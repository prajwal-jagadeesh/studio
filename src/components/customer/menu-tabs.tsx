"use client";

import type { MenuItem } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MenuTabsProps {
  menuItems: MenuItem[];
  onAddToOrder: (item: MenuItem) => void;
}

export function MenuTabs({ menuItems, onAddToOrder }: MenuTabsProps) {
  const categories = [
    "Starters",
    "Main Course",
    "Breads",
    "Desserts",
    "Beverages",
  ];

  return (
    <Tabs defaultValue="Starters" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {categories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category) => (
        <TabsContent key={category} value={category}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={item.imageHint}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold font-headline text-primary">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-lg font-semibold text-accent">
                        ₹{item.price}
                      </p>
                      <Button onClick={() => onAddToOrder(item)}>Add</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
