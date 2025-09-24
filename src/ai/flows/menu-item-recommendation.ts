'use server';

/**
 * @fileOverview An AI agent that recommends menu items based on current order and customer preferences.
 *
 * - menuItemRecommendation - A function that handles the menu item recommendation process.
 * - MenuItemRecommendationInput - The input type for the menuItemRecommendation function.
 * - MenuItemRecommendationOutput - The return type for the menuItemRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MenuItemRecommendationInputSchema = z.object({
  currentOrderItems: z
    .array(z.string())
    .describe('List of menu item names currently in the order.'),
  customerPreferences: z
    .string()
    .optional()
    .describe('Optional description of customer preferences.'),
  orderHistory: z
    .array(z.string())
    .optional()
    .describe('Optional list of previous order menu item names.'),
});
export type MenuItemRecommendationInput = z.infer<
  typeof MenuItemRecommendationInputSchema
>;

const MenuItemRecommendationOutputSchema = z.object({
  recommendedItems: z
    .array(z.string())
    .describe('List of recommended menu item names.'),
  reasoning: z
    .string()
    .describe('Explanation of why these items are recommended.'),
});
export type MenuItemRecommendationOutput = z.infer<
  typeof MenuItemRecommendationOutputSchema
>;

export async function menuItemRecommendation(
  input: MenuItemRecommendationInput
): Promise<MenuItemRecommendationOutput> {
  return menuItemRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'menuItemRecommendationPrompt',
  input: {schema: MenuItemRecommendationInputSchema},
  output: {schema: MenuItemRecommendationOutputSchema},
  prompt: `You are a helpful AI assistant that recommends menu items to customers in Nikee's Zara Veg Rooftop restaurant.

  Consider the current order, customer preferences, and order history to provide relevant recommendations.
  Return a list of recommended items and a brief explanation of your reasoning. Focus on upselling and enhancing customer satisfaction.

  Current Order Items: {{{currentOrderItems}}}
  Customer Preferences: {{{customerPreferences}}}
  Order History: {{{orderHistory}}}

  Respond with the recommended items and your reasoning. Be brief and concise.
  `,
});

const menuItemRecommendationFlow = ai.defineFlow(
  {
    name: 'menuItemRecommendationFlow',
    inputSchema: MenuItemRecommendationInputSchema,
    outputSchema: MenuItemRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
