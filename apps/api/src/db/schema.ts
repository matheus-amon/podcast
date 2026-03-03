import { pgTable, serial, text, timestamp, doublePrecision, date, boolean, integer, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['GUEST', 'HOST', 'PRODUCER']);
export const leadStatusEnum = pgEnum('lead_status', ['PROSPECT', 'CONTACTED', 'CONFIRMED', 'RECORDED']);
export const eventTypeEnum = pgEnum('event_type', ['RECORDING', 'RELEASE', 'MEETING', 'OTHER']);
export const budgetTypeEnum = pgEnum('budget_type', ['INCOME', 'EXPENSE']);
export const billingStatusEnum = pgEnum('billing_status', ['PAID', 'PENDING', 'OVERDUE']);
export const budgetStatusEnum = pgEnum('budget_status', ['PLANNED', 'APPROVED', 'PAID', 'PENDING']);
export const episodeStatusEnum = pgEnum('episode_status', ['PLANNED', 'SCRIPTING', 'RECORDED', 'EDITING', 'PUBLISHED']);
export const taskStatusEnum = pgEnum('task_status', ['TODO', 'IN_PROGRESS', 'DONE']);

// Leads (Guests/CRM)
export const leads = pgTable('leads', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    role: roleEnum('role').default('GUEST'),
    status: leadStatusEnum('status').default('PROSPECT'),
    source: text('source').default('unknown'),
    assignedTo: text('assigned_to'),
    company: text('company'),
    position: text('position'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    linkedinUrl: text('linkedin_url'),
    tags: jsonb('tags').$type<string[]>(), // Array of strings
    notes: text('notes'),
    lastContact: timestamp('last_contact'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    idx_leads_email: index('idx_leads_email').on(table.email),
    idx_leads_status: index('idx_leads_status').on(table.status),
    idx_leads_created_at: index('idx_leads_created_at').on(table.createdAt.desc()),
    idx_leads_assigned_to: index('idx_leads_assigned_to').on(table.assignedTo),
    idx_leads_source: index('idx_leads_source').on(table.source),
}));

export const leadInteractionTypeEnum = pgEnum('lead_interaction_type', ['EMAIL', 'CALL', 'MESSAGE', 'MEETING', 'OTHER']);

// Lead Interactions (History)
export const leadInteractions = pgTable('lead_interactions', {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id').references(() => leads.id).notNull(),
    type: leadInteractionTypeEnum('type').default('OTHER'),
    content: text('content').notNull(),
    date: timestamp('date').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    idx_lead_interactions_lead_id: index('idx_lead_interactions_lead_id').on(table.leadId),
    idx_lead_interactions_date: index('idx_lead_interactions_date').on(table.date.desc()),
}));

// Episodes (Content)
export const episodes = pgTable('episodes', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    season: integer('season').default(1),
    number: integer('number'),
    status: episodeStatusEnum('status').default('PLANNED'),
    publishDate: timestamp('publish_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    idx_episodes_status: index('idx_episodes_status').on(table.status),
    idx_episodes_publish_date: index('idx_episodes_publish_date').on(table.publishDate.desc()),
}));

// Scripts (Content Creation)
export const scripts = pgTable('scripts', {
    id: serial('id').primaryKey(),
    episodeId: integer('episode_id').references(() => episodes.id).notNull(),
    content: text('content'), // Markdown content
    version: integer('version').default(1),
    lastEditedBy: text('last_edited_by'),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Agenda (Events/Calendar)
export const eventStatusEnum = pgEnum('event_status', ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const agenda = pgTable('agenda', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    type: eventTypeEnum('type').default('MEETING'),
    status: eventStatusEnum('status').default('SCHEDULED'),
    leadId: integer('lead_id').references(() => leads.id),
    episodeId: integer('episode_id').references(() => episodes.id), // Link event to episode
    participants: jsonb('participants'), // Array of emails or names
    color: text('color').default('#3B82F6'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    idx_agenda_start_date: index('idx_agenda_start_date').on(table.startDate.desc()),
    idx_agenda_lead_id: index('idx_agenda_lead_id').on(table.leadId),
    idx_agenda_episode_id: index('idx_agenda_episode_id').on(table.episodeId),
    idx_agenda_status: index('idx_agenda_status').on(table.status),
}));

// Production Tasks
export const productionTasks = pgTable('production_tasks', {
    id: serial('id').primaryKey(),
    episodeId: integer('episode_id').references(() => episodes.id),
    title: text('title').notNull(),
    status: taskStatusEnum('status').default('TODO'),
    assignee: text('assignee'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    idx_production_tasks_episode_id: index('idx_production_tasks_episode_id').on(table.episodeId),
    idx_production_tasks_status: index('idx_production_tasks_status').on(table.status),
}));

// Budget (Finance/Expenses)
export const budget = pgTable('budget', {
    id: serial('id').primaryKey(),
    concept: text('concept').notNull(),
    amount: doublePrecision('amount').notNull(),
    type: budgetTypeEnum('type').default('EXPENSE'),
    category: text('category').notNull(), // e.g., Production, Marketing, Equipment
    date: date('date').defaultNow(),
    responsible: text('responsible'),
    status: budgetStatusEnum('status').default('PENDING'),
    connectedEpisodeId: integer('connected_episode_id').references(() => episodes.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    idx_budget_type: index('idx_budget_type').on(table.type),
    idx_budget_category: index('idx_budget_category').on(table.category),
    idx_budget_date: index('idx_budget_date').on(table.date.desc()),
    idx_budget_episode_id: index('idx_budget_episode_id').on(table.connectedEpisodeId),
}));

// Budget Templates (Recurring Items)
export const budgetTemplates = pgTable('budget_templates', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(), // e.g., "Standard Episode Costs"
    items: jsonb('items').$type<{ concept: string; amount: number; type: 'INCOME' | 'EXPENSE'; category: string }[]>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Billing (Invoices/Receivables)
export const billing = pgTable('billing', {
    id: serial('id').primaryKey(),
    clientName: text('client_name').notNull(),
    amount: doublePrecision('amount').notNull(),
    dueDate: date('due_date').notNull(),
    status: billingStatusEnum('status').default('PENDING'),
    invoiceNumber: text('invoice_number'),
    subscriptionPlan: text('subscription_plan'), // BASIC, PRO, ENTERPRISE
    description: text('description'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    idx_billing_status: index('idx_billing_status').on(table.status),
    idx_billing_due_date: index('idx_billing_due_date').on(table.dueDate),
    idx_billing_invoice_number: index('idx_billing_invoice_number').on(table.invoiceNumber),
}));

// Payments
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'CHARGEBACK']);
export const paymentMethodEnum = pgEnum('payment_method', ['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE']);

export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    invoiceId: integer('invoice_id').notNull(),
    amount: doublePrecision('amount').notNull(),
    method: paymentMethodEnum('method').notNull(),
    status: paymentStatusEnum('status').default('PENDING'),
    transactionId: text('transaction_id'),
    paidAt: timestamp('paid_at'),
    refundedAt: timestamp('refunded_at'),
    refundReason: text('refund_reason'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    idx_payments_invoice_id: index('idx_payments_invoice_id').on(table.invoiceId),
    idx_payments_status: index('idx_payments_status').on(table.status),
    idx_payments_transaction_id: index('idx_payments_transaction_id').on(table.transactionId),
}));

// Metrics (Analytics)
export const metrics = pgTable('metrics', {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    revenue: doublePrecision('revenue').default(0),
    activeEpisodes: integer('active_episodes').default(0),
    newLeads: integer('new_leads').default(0),
    storageUsed: doublePrecision('storage_used').default(0), // in GB
    createdAt: timestamp('created_at').defaultNow(),
});

// Whitelabel Config
export const whitelabelConfig = pgTable('whitelabel_config', {
    id: serial('id').primaryKey(),
    logoUrl: text('logo_url'),
    primaryColor: text('primary_color').default('#3B82F6'),
    secondaryColor: text('secondary_color').default('#1E40AF'),
    companyName: text('company_name').default('Podcast SaaS'),
    subdomain: text('subdomain'),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// Relations
// ============================================================================

// Leads ↔ LeadInteractions (one-to-many)
export const leadsRelations = relations(leads, ({ many }) => ({
    interactions: many(leadInteractions),
    agendaEvents: many(agenda),
}));

export const leadInteractionsRelations = relations(leadInteractions, ({ one }) => ({
    lead: one(leads, {
        fields: [leadInteractions.leadId],
        references: [leads.id],
    }),
}));

// Episodes ↔ Scripts, Agenda, Budget, ProductionTasks (one-to-many)
export const episodesRelations = relations(episodes, ({ many }) => ({
    scripts: many(scripts),
    agendaEvents: many(agenda),
    budgetEntries: many(budget),
    productionTasks: many(productionTasks),
}));

export const scriptsRelations = relations(scripts, ({ one }) => ({
    episode: one(episodes, {
        fields: [scripts.episodeId],
        references: [episodes.id],
    }),
}));

// Agenda ↔ Leads, Episodes (many-to-one)
export const agendaRelations = relations(agenda, ({ one }) => ({
    lead: one(leads, {
        fields: [agenda.leadId],
        references: [leads.id],
    }),
    episode: one(episodes, {
        fields: [agenda.episodeId],
        references: [episodes.id],
    }),
}));

// Budget ↔ Episodes (many-to-one)
export const budgetRelations = relations(budget, ({ one }) => ({
    episode: one(episodes, {
        fields: [budget.connectedEpisodeId],
        references: [episodes.id],
    }),
}));

// ProductionTasks ↔ Episodes (many-to-one)
export const productionTasksRelations = relations(productionTasks, ({ one }) => ({
    episode: one(episodes, {
        fields: [productionTasks.episodeId],
        references: [episodes.id],
    }),
}));

// WhitelabelConfig (no relations needed - singleton config table)
export const whitelabelConfigRelations = relations(whitelabelConfig, () => ({}));

// Billing ↔ Payments (one-to-many)
export const billingRelations = relations(billing, ({ many }) => ({
    payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    invoice: one(billing, {
        fields: [payments.invoiceId],
        references: [billing.id],
    }),
}));
