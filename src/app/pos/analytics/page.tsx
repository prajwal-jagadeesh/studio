import { AnalyticsView } from "@/components/pos/analytics-view";
import { analyticsData } from "@/lib/data";

export default function AnalyticsPage() {
  const totalRevenue = analyticsData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = analyticsData.reduce((sum, day) => sum + day.totalOrders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const stats = {
    totalRevenue,
    totalOrders,
    avgOrderValue,
  };
  
  return (
     <div>
      <header className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Review your restaurant's performance metrics.
        </p>
      </header>
      <AnalyticsView stats={stats} chartData={analyticsData} />
    </div>
  );
}
