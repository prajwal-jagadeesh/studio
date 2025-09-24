import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ClipboardList, Laptop } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">
          Zara Veg Order
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mt-4">
          Welcome to Nikee's Zara Veg Rooftop
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
        <Link href="/menu" className="transform transition-transform hover:scale-105">
          <Card className="h-full text-center hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <UtensilsCrossed className="mx-auto h-16 w-16 text-accent" />
            </CardHeader>
            <CardContent>
              <CardTitle className="font-headline text-2xl text-primary">Customer App</CardTitle>
              <p className="text-muted-foreground mt-2">
                Browse the menu and place your order.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/captain" className="transform transition-transform hover:scale-105">
          <Card className="h-full text-center hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <ClipboardList className="mx-auto h-16 w-16 text-accent" />
            </CardHeader>
            <CardContent>
              <CardTitle className="font-headline text-2xl text-primary">Captain App</CardTitle>
              <p className="text-muted-foreground mt-2">
                Manage tables and incoming orders.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pos" className="transform transition-transform hover:scale-105">
          <Card className="h-full text-center hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <CardHeader>
              <Laptop className="mx-auto h-16 w-16 text-accent" />
            </CardHeader>
            <CardContent>
              <CardTitle className="font-headline text-2xl text-primary">POS App</CardTitle>
              <p className="text-muted-foreground mt-2">
                Print bills and view analytics.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <footer className="mt-16 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Zara Veg Order. All rights reserved.</p>
      </footer>
    </main>
  );
}
