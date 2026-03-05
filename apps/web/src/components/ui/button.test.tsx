import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByText('Click me')
    expect(button).toBeInTheDocument()
  })

  it('should render with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    
    const button = screen.getByText('Outline')
    expect(button).toHaveClass('border')
  })

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    
    const button = screen.getByText('Ghost')
    expect(button).toHaveClass('hover:bg-accent')
  })

  it('should render with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>)
    
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-destructive')
  })

  it('should render with small size', () => {
    render(<Button size="sm">Small</Button>)
    
    const button = screen.getByText('Small')
    expect(button).toHaveClass('h-8')
  })

  it('should render with large size', () => {
    render(<Button size="lg">Large</Button>)
    
    const button = screen.getByText('Large')
    expect(button).toHaveClass('h-10')
  })

  it('should render as icon button', () => {
    render(<Button size="icon">🔍</Button>)
    
    const button = screen.getByText('🔍')
    expect(button).toHaveClass('h-9 w-9')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByText('Disabled')
    expect(button).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByText('Custom')
    expect(button).toHaveClass('custom-class')
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    const button = screen.getByText('Click')
    button.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
