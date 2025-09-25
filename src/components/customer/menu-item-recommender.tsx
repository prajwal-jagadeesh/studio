"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, Lightbulb } from "lucide-react";
import { menuItemRecommendation } from "@/ai/flows/menu-item-recommendation";
import type {
  MenuItemRecommendationInput,
  MenuItemRecommendationOutput,
} from "@/ai/flows/menu-item-recommendation";
import type { Order } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MenuItemRecommenderProps {
  order: Order;
  onItemsAdd: (items: string[]) => void;
}

export function MenuItemRecommender({ order, onItemsAdd }: MenuItemRecommenderProps) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] =
    useState<MenuItemRecommendationOutput | null>(null);
  const { toast } = useToast();

  const handleGetRecommendation = async () => {
    setLoading(true);
    setRecommendation(null);
    try {
      const input: MenuItemRecommendationInput = {
        currentOrderItems: order.items.map((item) => item.name),
        // In a real app, these would be populated with actual customer data
        customerPreferences: "Loves spicy food, prefers North Indian cuisine.",
        orderHistory: ["Veg Seekh Kebab", "Dal Makhani"],
      };
      const result = await menuItemRecommendation(input);
      setRecommendation(result);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      toast({
        variant: "destructive",
        title: "AI Recommendation Failed",
        description: "Could not fetch recommendations at this time.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecommended = () => {
    if (recommendation) {
      onItemsAdd(recommendation.recommendedItems);
      toast({
          title: "Items Added!",
          description: "We've added the recommended items to your cart. Click 'Add to Order' to confirm."
      })
      setRecommendation(null); // Clear recommendation after adding
    }
  };

  return (
    <Card className="bg-secondary mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-secondary-foreground text-lg">
          <Zap className="h-5 w-5 text-accent" />
          Hungry for more?
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && !recommendation && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4 text-sm">
              Get AI-powered suggestions to complement your meal.
            </p>
            <Button onClick={handleGetRecommendation} size="sm">
              <Lightbulb className="mr-2 h-4 w-4" />
              Suggest Items
            </Button>
          </div>
        )}

        {recommendation && (
          <div>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle className="font-bold">{recommendation.recommendedItems.join(", ")}</AlertTitle>
              <AlertDescription>
                <strong>Reasoning:</strong> {recommendation.reasoning}
              </AlertDescription>
            </Alert>
            <Button onClick={handleAddRecommended} className="w-full mt-4">
                Add to Cart
            </Button>
          </div>

        )}
      </CardContent>
    </Card>
  );
}
