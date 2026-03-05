'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueChartProps {
  data?: Array<{
    name: string
    revenue: number
    expenses: number
  }>
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground text-sm">
              No revenue data available
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              name="Income"
            />
            <Bar
              dataKey="expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
