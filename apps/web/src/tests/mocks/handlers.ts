import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

// Mock handlers for API
export const handlers = [
  // Leads
  http.get('/api/leads', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'GUEST',
        status: 'PROSPECT',
        company: 'Acme Corp',
        position: 'CEO',
        avatarUrl: null,
        source: 'website',
        lastContact: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
  }),

  http.post('/api/leads', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 2,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),

  // Episodes
  http.get('/api/episodes', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Episode 1',
        description: 'First episode',
        season: 1,
        number: 1,
        status: 'PUBLISHED',
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
  }),

  // Agenda Events
  http.get('/api/agenda/events', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Recording Session',
        description: 'Podcast recording',
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600000).toISOString(),
        type: 'RECORDING',
        status: 'SCHEDULED',
        leadId: null,
        episodeId: null,
        participants: [],
        color: '#3B82F6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
  }),

  // Budget
  http.get('/api/budget', () => {
    return HttpResponse.json([
      {
        id: 1,
        concept: 'Equipment',
        amount: 1000,
        type: 'EXPENSE',
        category: 'Production',
        date: new Date().toISOString(),
        responsible: 'John',
        status: 'APPROVED',
        connectedEpisodeId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ])
  }),

  http.get('/api/budget/summary', () => {
    return HttpResponse.json({
      totalIncome: 5000,
      totalExpense: 2000,
      balance: 3000,
      count: 5,
    })
  }),

  // Billing/Invoices
  http.get('/api/billing/invoices', () => {
    return HttpResponse.json([
      {
        id: 1,
        clientName: 'Client A',
        amount: 1500,
        dueDate: new Date().toISOString(),
        status: 'PENDING',
        invoiceNumber: 'INV-001',
        subscriptionPlan: 'PRO',
        description: 'Monthly subscription',
        paidAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ])
  }),

  http.get('/api/billing/invoices/summary', () => {
    return HttpResponse.json({
      totalBilled: 5000,
      totalPaid: 3000,
      totalPending: 1500,
      totalOverdue: 500,
      count: 10,
    })
  }),

  // Reports/Dashboard
  http.get('/api/reports/dashboard', () => {
    return HttpResponse.json({
      totalLeads: 25,
      activeEpisodes: 8,
      monthlyRevenue: 5000,
      upcomingEvents: 3,
      totalInvoices: 10,
      pendingPayments: 2,
    })
  }),

  http.get('/api/reports/financial/trend', () => {
    return HttpResponse.json([
      { name: 'Jan', revenue: 4000, expenses: 2400 },
      { name: 'Feb', revenue: 3000, expenses: 1398 },
      { name: 'Mar', revenue: 5000, expenses: 3800 },
      { name: 'Apr', revenue: 4780, expenses: 3908 },
      { name: 'May', revenue: 5890, expenses: 4800 },
      { name: 'Jun', revenue: 5000, expenses: 4000 },
    ])
  }),

  http.get('/api/reports/recent-activity', () => {
    return HttpResponse.json({
      recentLeads: [
        { id: 1, name: 'John Doe', company: 'Acme', avatarUrl: null },
      ],
      recentEpisodes: [
        { id: 1, title: 'Episode 1', status: 'PUBLISHED' },
      ],
    })
  }),

  // Whitelabel/Settings
  http.get('/api/whitelabel/config', () => {
    return HttpResponse.json({
      id: 1,
      logoUrl: null,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      companyName: 'Podcast SaaS',
      subdomain: null,
      updatedAt: new Date().toISOString(),
    })
  }),

  http.post('/api/whitelabel/config', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 1,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  }),
]

export const server = setupServer(...handlers)
