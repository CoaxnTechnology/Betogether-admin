import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  UserCheck,
  CheckCircle,
  UserPlus,
  Clock,
  DollarSign,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Star,
  Briefcase,
  Layers,
  Tags 
} from "lucide-react";

const iconMap = {
  users: Users,
  calendar: Calendar,
  "user-check": UserCheck,
  "check-circle": CheckCircle,
  "user-plus": UserPlus,
  clock: Clock,
  "dollar-sign": DollarSign,
  "graduation-cap": GraduationCap,
  "alert-circle": AlertCircle,
  "Briefcase":Briefcase,
  "Layers":Layers,
   tags: Tags,
  star: Star,
};

interface SummaryWidgetProps {
  title: string;
  value: string;
  change?: string; // optional
  trend?: "up" | "down"; // optional
  icon: keyof typeof iconMap;
  color: "primary" | "success" | "warning" | "destructive";
  className?: string;
  style?: React.CSSProperties;
}

export function SummaryWidget({
  title,
  value,
  change,
  trend,
  icon,
  color,
  className,
  style,
}: SummaryWidgetProps) {
  const IconComponent = iconMap[icon];

  const colorVariants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-card to-card/80",
        className
      )}
      style={style}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>

            {/* Only show trend section if both trend and change are provided */}
            {trend && change && (
              <div className="flex items-center space-x-1 text-sm">
                {trend === "up" ? (
                  <TrendingUp className={cn("h-4 w-4", trendColors[trend])} />
                ) : (
                  <TrendingDown className={cn("h-4 w-4", trendColors[trend])} />
                )}
                <span className={cn("font-medium", trendColors[trend])}>
                  {change}
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>

          <div
            className={cn("p-3 rounded-full border-2", colorVariants[color])}
          >
            <IconComponent className="h-6 w-6" />
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div
          className={cn(
            "absolute top-0 right-0 w-32 h-32 opacity-5 -translate-y-8 translate-x-8",
            color === "primary" &&
              "bg-gradient-to-br from-primary to-primary-glow",
            color === "success" &&
              "bg-gradient-to-br from-success to-success/60",
            color === "warning" &&
              "bg-gradient-to-br from-warning to-warning/60",
            color === "destructive" &&
              "bg-gradient-to-br from-destructive to-destructive/60"
          )}
          style={{ borderRadius: "50%" }}
        />
      </CardContent>
    </Card>
  );
}
