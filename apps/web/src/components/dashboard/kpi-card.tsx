import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  className?: string
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
            {trend && (
              <span className={cn(
                "ml-2",
                trend.type === 'positive' && "text-green-600",
                trend.type === 'negative' && "text-red-600"
              )}>
                {trend.value}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
