//import { PayrollCard } from "./PayrollCard";
import { ChartCard } from "./ChartCard";
import { SummaryWidget } from "./SummaryWidget";

const appData = [
  {
    title: "USER MANAGEMENT",
    period: "Monthly Report: Oct 2025",
    pending: 35,
    complete: 120,
    variant: "primary" as const,
  },
  {
    title: "CATEGORY MANAGEMENT",
    period: "Monthly Report: Oct 2025",
    pending: 8,
    complete: 42,
    variant: "success" as const,
  },
  {
    title: "SERVICE REQUESTS",
    period: "Monthly Report: Oct 2025",
    pending: 15,
    complete: 60,
    variant: "warning" as const,
  },
  {
    title: "NOTIFICATIONS",
    period: "Monthly Report: Oct 2025",
    pending: 10,
    complete: 95,
    variant: "secondary" as const,
  },
  {
    title: "REVIEWS & RATINGS",
    period: "Monthly Report: Oct 2025",
    pending: 12,
    complete: 80,
    variant: "destructive" as const,
  },
  {
    title: "PARTNER REGISTRATIONS",
    period: "Monthly Report: Oct 2025",
    pending: 6,
    complete: 25,
    variant: "primary" as const,
  },
  {
    title: "ROOM BOOKINGS",
    period: "Monthly Report: Oct 2025",
    pending: 20,
    complete: 145,
    variant: "success" as const,
  },
  {
    title: "APP FEEDBACK",
    period: "Monthly Report: Oct 2025",
    pending: 5,
    complete: 40,
    variant: "warning" as const,
  },
];

const summaryWidgets = [
  {
    title: "Total Users",
    value: "8,542",
    change: "+5.4%",
    trend: "up" as const,
    icon: "users" as const,
    color: "primary" as const,
  },
  {
    title: "Total Services",
    value: "126",
    change: "+3.2%",
    trend: "up" as const,
    icon: "Briefcase" as const,
    color: "success" as const,
  },
  {
    title: "Total Categories",
    value: "18",
    change: "+12%",
    trend: "up" as const,
    icon: "Layers" as const,
    color: "warning" as const,
  },
  {
    title: "Bookings This Month",
    value: "1,342",
    change: "+8.5%",
    trend: "up" as const,
    icon: "calendar" as const,
    color: "primary" as const,
  },
  {
    title: "Total Fake Users",
    value: "42",
    icon: "alert-circle" as const,
    color: "destructive" as const,
  },
  {
    title: "Block User",
    value: "19",
    change: "-1.8%",
    trend: "down" as const,
    icon: "check-circle" as const,
    color: "destructive" as const,
  },
  {
    title: "Total Revenue (This Month)",
    value: "₹2,000",
    change: "+9%",
    trend: "up" as const,
    icon: "dollar-sign" as const,
    color: "success" as const,
  },
  {
    title: "Total Tags",
    value: "50",
    icon: "tags" as const,
    color: "primary" as const,
  },
];

const chartData = {
  users: [
    { name: "New Users", value: 520, color: "hsl(210 100% 56%)" },
    { name: "Block User", value: 760, color: "hsl(168 100% 50%)" },
    { name: "Inactive Users", value: 140, color: "hsl(0 70% 55%)" },
  ],
  services: [
    { name: "Total", value: 126, color: "hsl(142 70% 45%)" },
    { name: "Expired", value: 34, color: "hsl(0 70% 55%)" },
    { name: "Upcoming", value: 12, color: "hsl(45 90% 55%)" },
  ],
  bookings: [
    { name: "Completed", value: 1142, color: "hsl(168 100% 50%)" },
    { name: "Pending", value: 145, color: "hsl(210 100% 56%)" },
    { name: "Cancelled", value: 55, color: "hsl(0 70% 55%)" },
  ],
  Reviews: [
    { name: "Positive", value: 320, color: "hsl(142 70% 45%)" },
    { name: "Neutral", value: 95, color: "hsl(45 90% 55%)" },
    { name: "Negative", value: 40, color: "hsl(0 70% 55%)" },
  ],
};

export function StatsGrid() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {summaryWidgets.map((widget, index) => (
          <SummaryWidget
            key={index}
            title={widget.title}
            value={widget.value}
            change={widget.change}
            trend={widget.trend}
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
        <ChartCard title="Reviews" data={chartData.Reviews} />
      </div>

      {/* Category & Service Cards Grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-visible">
        {appData.map((card, index) => (
          <PayrollCard
            key={index}
            title={card.title}
            period={card.period}
            pending={card.pending}
            complete={card.complete}
            variant={card.variant}
            className="animate-scale-in relative overflow-visible"
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div> */}
    </div>
  );
}

export default StatsGrid;
