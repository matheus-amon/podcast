import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPICard } from '../dashboard/kpi-card'
import { TrendingUp } from 'lucide-react'

describe('KPICard', () => {
  it('should render title and value correctly', () => {
    render(
      <KPICard
        title="Total Leads"
        value="124"
      />
    )

    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('124')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(
      <KPICard
        title="Total Leads"
        value="124"
        description="+20.1% from last month"
      />
    )

    expect(screen.getByText('+20.1% from last month')).toBeInTheDocument()
  })

  it('should apply custom className when provided', () => {
    const { container } = render(
      <KPICard
        title="Test"
        value="100"
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
