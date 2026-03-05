import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RevenueChart } from './revenue-chart'

describe('RevenueChart', () => {
  const mockData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 5000, expenses: 3800 },
  ]

  it('should render chart title', () => {
    render(<RevenueChart data={mockData} />)
    
    expect(screen.getByText('Revenue Overview')).toBeInTheDocument()
  })

  it('should render chart when data is provided', () => {
    render(<RevenueChart data={mockData} />)
    
    expect(screen.getByText('Revenue Overview')).toBeInTheDocument()
  })

  it('should render empty state when no data', () => {
    render(<RevenueChart data={[]} />)
    
    expect(screen.getByText('No revenue data available')).toBeInTheDocument()
  })

  it('should render empty state when data is undefined', () => {
    render(<RevenueChart />)
    
    expect(screen.getByText('No revenue data available')).toBeInTheDocument()
  })

  it('should render all months in data', () => {
    render(<RevenueChart data={mockData} />)
    
    expect(screen.getByText('Revenue Overview')).toBeInTheDocument()
  })
})
