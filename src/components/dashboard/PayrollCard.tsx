// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { Badge } from "@/components/ui/badge"
// import { cn } from "@/lib/utils"

// interface PayrollCardProps extends React.HTMLAttributes<HTMLDivElement> {
//   title: string
//   period: string
//   pending: number
//   complete: number
//   variant?: "default" | "success" | "warning" | "destructive" | "primary" | "secondary"
// }

// const variantStyles = {
//   default: "border-border",
//   success: "border-success/20 bg-success/5",
//   warning: "border-warning/20 bg-warning/5", 
//   destructive: "border-destructive/20 bg-destructive/5",
//   primary: "border-primary/20 bg-primary/5",
//   secondary: "border-accent/20 bg-accent/5"
// }

// const variantColors = {
//   default: "bg-muted",
//   success: "bg-success",
//   warning: "bg-warning", 
//   destructive: "bg-destructive",
//   primary: "bg-primary",
//   secondary: "bg-accent"
// }

// export function PayrollCard({ 
//   title, 
//   period, 
//   pending, 
//   complete, 
//   className,
//   variant = "default",
//   ...props
// }: PayrollCardProps) {
//   const total = pending + complete
//   const completionPercentage = total > 0 ? (complete / total) * 100 : 0

//   return (
//     <Card 
//       className={cn(
//         "shadow-card hover:shadow-hover transition-smooth cursor-pointer group",
//         variantStyles[variant],
//         className
//       )}
//       {...props}
//     >
//       <CardHeader className="pb-3">
//         <div className={cn(
//           "w-full h-1 rounded-full mb-3",
//           variantColors[variant]
//         )} />
//         <CardTitle className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
//           {title}
//         </CardTitle>
//         <p className="text-sm text-muted-foreground">{period}</p>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="space-y-3">
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-medium text-destructive">Approval Pending:</span>
//             <Badge variant="destructive" className="font-semibold">
//               {pending}
//             </Badge>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-medium text-success">Approval Complete:</span>
//             <Badge variant="secondary" className="bg-success text-success-foreground font-semibold">
//               {complete}
//             </Badge>
//           </div>
//         </div>
        
//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span className="text-muted-foreground">Progress</span>
//             <span className="font-medium">{Math.round(completionPercentage)}%</span>
//           </div>
//           <Progress 
//             value={completionPercentage} 
//             className="h-2"
//           />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }