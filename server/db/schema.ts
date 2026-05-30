import { sqliteTable, text, integer, real, index, unique } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}))

// Categories table
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('slate'),
  targetAllocation: real('target_allocation').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  archivedAt: integer('archived_at', { mode: 'timestamp' }),
}, (table) => ({
  userIdIdx: index('categories_user_id_idx').on(table.userId),
  userArchivedIdx: index('categories_user_archived_idx').on(table.userId, table.archivedAt),
}))

// Assets table
export const assets = sqliteTable('assets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  trackingType: text('tracking_type', { enum: ['numeric', 'currency', 'hours', 'count', 'percentage', 'rating', 'milestone', 'notes'] }).default('numeric'),
  timeHorizon: text('time_horizon', { enum: ['short', 'medium', 'long'] }).default('medium'),
  targetValue: real('target_value'),
  currentValue: real('current_value').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  archivedAt: integer('archived_at', { mode: 'timestamp' }),
}, (table) => ({
  categoryIdIdx: index('assets_category_id_idx').on(table.categoryId),
  categoryArchivedIdx: index('assets_category_archived_idx').on(table.categoryId, table.archivedAt),
}))

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  assetId: text('asset_id').notNull().references(() => assets.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['active', 'paused', 'completed', 'archived'] }).default('active'),
  startDate: integer('start_date', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  targetDate: integer('target_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  assetIdIdx: index('projects_asset_id_idx').on(table.assetId),
  statusIdx: index('projects_status_idx').on(table.status),
}))

// Investments table
export const investments = sqliteTable('investments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  assetId: text('asset_id').notNull().references(() => assets.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  amount: real('amount').notNull(),
  note: text('note'),
  date: integer('date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  assetIdIdx: index('investments_asset_id_idx').on(table.assetId),
  projectIdIdx: index('investments_project_id_idx').on(table.projectId),
  dateIdx: index('investments_date_idx').on(table.date),
}))

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index('tags_user_id_idx').on(table.userId),
  userNameUnique: unique('tags_user_name_unique').on(table.userId, table.name),
}))

// Notes table
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  assetId: text('asset_id').references(() => assets.id, { onDelete: 'set null' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index('notes_user_id_idx').on(table.userId),
  categoryIdIdx: index('notes_category_id_idx').on(table.categoryId),
  assetIdIdx: index('notes_asset_id_idx').on(table.assetId),
  projectIdIdx: index('notes_project_id_idx').on(table.projectId),
}))

// Note to Tag mapping
export const noteToTags = sqliteTable('note_to_tags', {
  noteId: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: unique().on(table.noteId, table.tagId),
}))

// Note Links (backlinks)
export const noteLinks = sqliteTable('note_links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromNoteId: text('from_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  toNoteId: text('to_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  fromNoteIdx: index('note_links_from_idx').on(table.fromNoteId),
  toNoteIdx: index('note_links_to_idx').on(table.toNoteId),
}))

// Reviews table
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['weekly', 'monthly', 'quarterly', 'annual'] }).notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index('reviews_user_id_idx').on(table.userId),
  typeIdx: index('reviews_type_idx').on(table.type),
  dateIdx: index('reviews_date_idx').on(table.date),
}))

// Review Responses table
export const reviewResponses = sqliteTable('review_responses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reviewId: text('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  reviewIdIdx: index('review_responses_review_id_idx').on(table.reviewId),
}))

// Settings table
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').default('light'),
  currency: text('currency').default('USD'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  assets: many(assets),
  notes: many(notes),
}))

export const assetsRelations = relations(assets, ({ one, many }) => ({
  category: one(categories, { fields: [assets.categoryId], references: [categories.id] }),
  projects: many(projects),
  investments: many(investments),
  notes: many(notes),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  asset: one(assets, { fields: [projects.assetId], references: [assets.id] }),
  investments: many(investments),
  notes: many(notes),
}))

export const investmentsRelations = relations(investments, ({ one }) => ({
  asset: one(assets, { fields: [investments.assetId], references: [assets.id] }),
  project: one(projects, { fields: [investments.projectId], references: [projects.id] }),
}))

export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  category: one(categories, { fields: [notes.categoryId], references: [categories.id] }),
  asset: one(assets, { fields: [notes.assetId], references: [assets.id] }),
  project: one(projects, { fields: [notes.projectId], references: [projects.id] }),
  tags: many(noteToTags),
  linkFrom: many(noteLinks, { relationName: 'from' }),
  linkTo: many(noteLinks, { relationName: 'to' }),
}))

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  notes: many(noteToTags),
}))

export const noteLinkRelations = relations(noteLinks, ({ one }) => ({
  from: one(notes, { fields: [noteLinks.fromNoteId], references: [notes.id], relationName: 'from' }),
  to: one(notes, { fields: [noteLinks.toNoteId], references: [notes.id], relationName: 'to' }),
}))

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  responses: many(reviewResponses),
}))

export const reviewResponsesRelations = relations(reviewResponses, ({ one }) => ({
  review: one(reviews, { fields: [reviewResponses.reviewId], references: [reviews.id] }),
}))