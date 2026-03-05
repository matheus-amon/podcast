import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './input'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('should render with type email', () => {
    render(<Input type="email" />)
    
    const input = screen.getByRole('textbox', { hidden: true })
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should render with type number', () => {
    render(<Input type="number" />)
    
    const input = screen.getByRole('spinbutton', { hidden: true })
    expect(input).toHaveAttribute('type', 'number')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox', { hidden: true })
    expect(input).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Input className="custom-class" />)
    
    const input = screen.getByRole('textbox', { hidden: true })
    expect(input).toHaveClass('custom-class')
  })

  it('should have border and shadow styles', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox', { hidden: true })
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('shadow-sm')
  })
})
