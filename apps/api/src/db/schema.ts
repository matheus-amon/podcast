import { pgTable, serial, text, timestamp, doublePrecision, date, boolean, integer, pgEnum, jsonb } from 'drizzle-orm/pg-core';

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
    role: roleEnum('role').default('GUEST'),
    status: leadStatusEnum('status').default('PROSPECT'),
    company: text('company'),
    position: text('position'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    linkedinUrl: text('linkedin_url'),
    tags: jsonb('tags').$type<string[]>(), // Array of strings
    notes: text('notes'),
    lastContact: timestamp('last_contact'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const leadInteractionTypeEnum = pgEnum('lead_interaction_type', ['EMAIL', 'CALL', 'MESSAGE', 'MEETING', 'OTHER']);

// Lead Interactions (History)
export const leadInteractions = pgTable('lead_interactions', {
    id: serial('id').primaryKey(),
    leadId: integer('lead_id').references(() => leads.id).notNull(),
    type: leadInteractionTypeEnum('type').default('OTHER'),
    content: text('content').notNull(),
    date: timestamp('date').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
});

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
});

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
export const agenda = pgTable('agenda', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    type: eventTypeEnum('type').default('MEETING'),
    leadId: integer('lead_id').references(() => leads.id),
    episodeId: integer('episode_id').references(() => episodes.id), // Link event to episode
    participants: jsonb('participants'), // Array of emails or names
    color: text('color').default('#3B82F6'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Production Tasks
export const productionTasks = pgTable('production_tasks', {
    id: serial('id').primaryKey(),
    episodeId: integer('episode_id').references(() => episodes.id),
    title: text('title').notNull(),
    status: taskStatusEnum('status').default('TODO'),
    assignee: text('assignee'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow(),
});

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
});

// Budget Templates (Recurring Items)
export const budgetTemplates = pgTable('budget_templates', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(), // e.g., "Standard Episode Costs"
    items: jsonb('items').$type<{ concept: string; amount: number; type: 'INCOME' | 'EXPENSE'; category: string }[]>(),
    createdAt: timestamp('created_at').defaultNow(),
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
    createdAt: timestamp('created_at').defaultNow(),
});

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
