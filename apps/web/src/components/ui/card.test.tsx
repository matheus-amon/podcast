import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'

describe('Card', () => {
  it('should render card with border and shadow', () => {
    render(<Card>Card Content</Card>)
    
    const card = screen.getByText('Card Content')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('shadow-sm')
  })

  it('should render CardHeader', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('should render CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    )
    
    const title = screen.getByText('Title')
    expect(title).toHaveClass('font-semibold')
  })

  it('should render CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Description</CardDescription>
        </CardHeader>
      </Card>
    )
    
    const description = screen.getByText('Description')
    expect(description).toHaveClass('text-muted-foreground')
  })

  it('should render CardContent', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>
    )
    
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should apply custom className to Card', () => {
    render(<Card className="custom-class">Content</Card>)
    
    const card = screen.getByText('Content')
    expect(card).toHaveClass('custom-class')
  })

  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
