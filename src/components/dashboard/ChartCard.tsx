import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { cn } from "@/lib/utils"

interface ChartDataItem {
  name: string
  value: number
  color: string
}

interface ChartCardProps {
  title: string
  data: ChartDataItem[]
  className?: string
}

export function ChartCard({ title, data, className }: ChartCardProps) {
  return (
    <Card
      className={cn(
        "shadow-card hover:shadow-hover transition-smooth",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart container with safe padding */}
        <div className="flex items-center justify-center w-full h-64 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="101%"
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legends */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
