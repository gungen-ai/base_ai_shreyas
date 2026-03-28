import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const merchants = pgTable('merchants', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  storeType: text('store_type').default('dropshipper'),
  supportEmail: text('support_email'),
  plan: text('plan').default('free').notNull(),
  widgetToken: text('widget_token').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const kbEntries = pgTable('kb_entries', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id').notNull().references(() => merchants.id),
  category: text('category').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  source: text('source').default('manual').notNull(),
  status: text('status').default('draft').notNull(),
  lastUpdatedAt: timestamp('last_updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id').notNull().references(() => merchants.id),
  customerIdentifier: text('customer_identifier'),
  channel: text('channel').default('widget').notNull(),
  rawQuery: text('raw_query').notNull(),
  draftedAnswer: text('drafted_answer'),
  status: text('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
})
