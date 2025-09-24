# **App Name**: Zara Veg Order

## Core Features:

- Menu Browsing (Customer App): Allows customers to browse the restaurant's menu with categories, descriptions, and pricing using data from Firestore.
- Order Placement (Customer App): Enables customers to place orders for their table using session-based or geo-location validation, specifying items and quantities which are then saved to Firestore with a 'pending' status. This ensures only customers at the restaurant can order. Zero-cost implementation is prioritized for all functions to fit within Firebase free tier.
- Real-time Order Updates (Captain App): Captain app provides a dashboard for accepting new orders, updating order statuses (e.g., preparing, ready, served), and setting preparation times, all reflected in real-time via Firestore listeners. Zero-cost Firestore listeners and data structures are essential.
- Menu Item Recommendation (Captain App): AI tool suggests related or popular menu items based on the current order and customer preferences. Uses order history, popularity metrics, and item similarities from Firestore. The LLM reasons about which recommendations are relevant to the current order. Zero-cost AI solutions are explored.
- KOT/Bill Printing (POS App): POS app enables printing of Kitchen Order Tickets (KOTs) and bills, updating order statuses to 'billed' and 'closed' in Firestore. Zero-cost printing solutions like browser printing are preferred.
- Analytics Dashboard (POS App): POS app displays a dashboard with key metrics like total orders, revenue, and average prep time. It retrieves aggregated data from Firestore's analytics collection to minimize reads, crucial for staying within the Firebase free tier.
- Table Management (Captain App): Captains can view table statuses and track orders associated with each table, ensuring efficient table turnover. Status updates reflected via Firestore, while minimizing read/write operations for cost efficiency.

## Style Guidelines:

- Primary color: Rich maroon (#800000) evoking warmth and appetite.
- Background color: Very light desaturated maroon (#F2E0E0) provides a subtle, appetizing backdrop.
- Accent color: Burnt orange (#CC5500) highlights important elements like CTAs and order details, creating a complementary contrast to the primary.
- Body and headline font: 'Alegreya', a humanist serif with an elegant, intellectual, contemporary feel, suitable for headlines or body text.
- Code font: 'Source Code Pro' for displaying code snippets, specifically in KOT/bill previews in the POS app.
- Use simple, outlined icons to represent menu categories and order statuses.  Icons should maintain consistency across all three apps.
- Customer app layout should be simple, focusing on visual presentation of food and ease of ordering.  Captain/POS apps prioritize information density, displaying order details in a clear tabular format.