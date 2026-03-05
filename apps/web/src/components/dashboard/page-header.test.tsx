import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Test Title" />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(<PageHeader title="Title" description="Test Description" />)
    
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    render(<PageHeader title="Title" />)
    
    expect(screen.queryByText('Description')).not.toBeInTheDocument()
  })

  it('should render actions when provided', () => {
    render(<PageHeader title="Title" actions={<button>Action</button>} />)
    
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<PageHeader title="Title" className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should render title with correct styling', () => {
    render(<PageHeader title="Test Title" />)
    
    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('font-bold')
    expect(title).toHaveClass('tracking-tight')
  })

  it('should render description with muted foreground', () => {
    render(<PageHeader title="Title" description="Description" />)
    
    const description = screen.getByText('Description')
    expect(description).toHaveClass('text-muted-foreground')
  })
})
