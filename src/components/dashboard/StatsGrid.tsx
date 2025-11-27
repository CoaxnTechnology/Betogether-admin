import { ChartCard } from "./ChartCard";
import { SummaryWidget } from "./SummaryWidget";
import { useEffect, useState } from "react";
import axios from "../../API/baseUrl";

export function StatsGrid() {
  const [summaryWidgets, setSummaryWidgets] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({
    users: [],
    services: [],
    bookings: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://be-together-node.vercel.app/api/stats"
        );
        const data = res.data;

        // Summary widgets
        const summary = [
          {
            title: "Total Users",
            value:
              data.summaryWidgets.find((w: any) => w.title === "Total Users")
                ?.value ||
              "8,542"?.value ||
              0,
            icon: "users",
            color: "primary",
          },
          {
            title: "Total Services",
            value:
              data.summaryWidgets.find((w: any) => w.title === "Total Services")
                ?.value ||
              "126"?.value ||
              0,
            icon: "Briefcase",
            color: "success",
          },
          {
            title: "Total Categories",
            value:
              data.summaryWidgets.find(
                (w: any) => w.title === "Total Categories"
              )?.value || 0,
            icon: "Layers",
            color: "warning",
          },
          {
            title: "Bookings This Month",
            value:
              data.summaryWidgets.find(
                (w: any) => w.title === "Bookings This Month"
              )?.value || "0", // static
            icon: "calendar",
            color: "primary",
          },
          {
            title: "Total Fake Users",
            value:
              data.summaryWidgets.find(
                (w: any) => w.title === "Total Fake Users"
              )?.value || 0,
            icon: "alert-circle",
            color: "destructive",
          },
          {
            title: "Block User",
            value: "0", // static
            icon: "check-circle",
            color: "destructive",
          },
          {
            title: "Total Revenue (This Month)",
            value: "₹2,000", // static
            icon: "dollar-sign",
            color: "success",
          },
          {
            title: "Total Tags",
            value:
              data.summaryWidgets.find((w: any) => w.title === "Total Tags")
                ?.value || 0,
            icon: "tags",
            color: "primary",
          },
        ];

        // Chart data
        const charts = {
          users: [
            {
              name: "Active Users",
              value:
                data.chartData.users?.find(
                  (u: any) => u.name === "Active Users"
                )?.value || 0,
              color: "hsl(210 100% 56%)",
            },
            {
              name: "Block User",
              value: 0, // you can replace with backend value if available
              color: "hsl(168 100% 50%)",
            },
            {
              name: "Inactive Users",
              value:
                data.chartData.users?.find(
                  (u: any) => u.name === "Inactive Users"
                )?.value || 0,
              color: "hsl(0 70% 55%)",
            },
          ],
          services: [
            {
              name: "Total",
              value: data.chartData.services?.[0]?.value || 0,
              color: "hsl(142 70% 45%)",
            },
            { name: "Expired", value: 0, color: "hsl(0 70% 55%)" },
            { name: "Upcoming", value: 0, color: "hsl(45 90% 55%)" },
          ],
          bookings: [
            {
              name: "Completed",
              value:
                data.chartData.bookings?.find((b) => b.name === "Completed")
                  ?.value || 0,
              color: "hsl(168 100% 50%)",
            },
            {
              name: "Pending", // frontend me Pending dikhana
              value:
                data.chartData.bookings?.find((b) => b.name === "Pending")
                  ?.value || 0,
              color: "hsl(210 100% 56%)",
            },
            {
              name: "Cancelled",
              value:
                data.chartData.bookings?.find((b) => b.name === "Cancelled")
                  ?.value || 0,
              color: "hsl(0 70% 55%)",
            },
          ],

          reviews: [
            {
              name: "Positive",
              value:
                data.chartData.reviews?.find((r: any) => r.name === "Positive")
                  ?.value || 0,
              color: "hsl(142 70% 45%)",
            },
            {
              name: "Neutral",
              value:
                data.chartData.reviews?.find((r: any) => r.name === "Neutral")
                  ?.value || 0,
              color: "hsl(45 90% 55%)",
            },
            {
              name: "Negative",
              value:
                data.chartData.reviews?.find((r: any) => r.name === "Negative")
                  ?.value || 0,
              color: "hsl(0 70% 55%)",
            },
          ],
        };

        setSummaryWidgets(summary);
        setChartData(charts);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {summaryWidgets.map((widget, index) => (
          <SummaryWidget
            key={index}
            title={widget.title}
            value={widget.value}
            icon={widget.icon}
            color={widget.color}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>

      {/* Chart Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ChartCard title="USERS" data={chartData.users} />
        <ChartCard title="SERVICES" data={chartData.services} />
        <ChartCard title="BOOKINGS" data={chartData.bookings} />
        <ChartCard title="Reviews" data={chartData.reviews} />
      </div>
    </div>
  );
}

export default StatsGrid;
