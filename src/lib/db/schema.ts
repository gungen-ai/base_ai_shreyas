import { pgTable, text, timestamp, integer, boolean, vector } from 'drizzle-orm/pg-core'

export const merchants = pgTable('merchants', {
  id: text('id').primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  storeType: text('store_type').default('dropshipper'),
  shopifyStoreId: text('shopify_store_id'),
  supportEmail: text('support_email'),
  twilioNumber: text('twilio_number'),
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

export const kbEmbeddings = pgTable('kb_embeddings', {
  id: text('id').primaryKey(),
  kbEntryId: text('kb_entry_id').notNull().references(() => kbEntries.id),
  embedding: vector('embedding', { dimensions: 1536 }),
  modelVersion: text('model_version').default('text-embedding-3-small').notNull(),
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

export const integrations = pgTable('integrations', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id').notNull().references(() => merchants.id),
  type: text('type').notNull(),
  credentialsRef: text('credentials_ref'),
  lastSyncedAt: timestamp('last_synced_at'),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  merchantId: text('merchant_id').notNull().references(() => merchants.id),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  plan: text('plan').default('free').notNull(),
  status: text('status').default('active').notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})