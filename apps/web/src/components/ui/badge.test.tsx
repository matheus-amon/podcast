import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Default</Badge>)
    
    const badge = screen.getByText('Default')
    expect(badge).toBeInTheDocument()
  })

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    
    const badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary')
  })

  it('should render with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)
    
    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('border')
  })

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    
    const badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive')
  })

  it('should render with success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    
    const badge = screen.getByText('Success')
    expect(badge).toBeInTheDocument()
  })

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    
    const badge = screen.getByText('Warning')
    expect(badge).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  it('should render children correctly', () => {
    render(<Badge>Test Content</Badge>)
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
