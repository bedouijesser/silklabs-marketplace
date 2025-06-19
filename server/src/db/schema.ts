
import { serial, text, pgTable, timestamp, boolean, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const developmentStageEnum = pgEnum('development_stage', ['Concept', 'Prototype', 'MVP', 'Launched']);
export const compensationTypeEnum = pgEnum('compensation_type', ['Volunteer', 'Compensated']);
export const applicationStatusEnum = pgEnum('application_status', ['Pending', 'Accepted', 'Rejected']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  bio: text('bio'),
  skills: text('skills').array().notNull().default([]),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Ideas table
export const ideasTable = pgTable('ideas', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  owner_id: integer('owner_id').notNull().references(() => usersTable.id),
  development_stage: developmentStageEnum('development_stage').notNull(),
  is_for_sale: boolean('is_for_sale'),
  price: numeric('price', { precision: 10, scale: 2 }),
  price_reasoning: text('price_reasoning'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Roles table
export const rolesTable = pgTable('roles', {
  id: serial('id').primaryKey(),
  idea_id: integer('idea_id').notNull().references(() => ideasTable.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  compensation_type: compensationTypeEnum('compensation_type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Applications table
export const applicationsTable = pgTable('applications', {
  id: serial('id').primaryKey(),
  role_id: integer('role_id').notNull().references(() => rolesTable.id),
  applicant_id: integer('applicant_id').notNull().references(() => usersTable.id),
  motivation: text('motivation').notNull(),
  status: applicationStatusEnum('status').notNull().default('Pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  ideas: many(ideasTable),
  applications: many(applicationsTable),
}));

export const ideasRelations = relations(ideasTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [ideasTable.owner_id],
    references: [usersTable.id],
  }),
  roles: many(rolesTable),
}));

export const rolesRelations = relations(rolesTable, ({ one, many }) => ({
  idea: one(ideasTable, {
    fields: [rolesTable.idea_id],
    references: [ideasTable.id],
  }),
  applications: many(applicationsTable),
}));

export const applicationsRelations = relations(applicationsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [applicationsTable.role_id],
    references: [rolesTable.id],
  }),
  applicant: one(usersTable, {
    fields: [applicationsTable.applicant_id],
    references: [usersTable.id],
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Idea = typeof ideasTable.$inferSelect;
export type NewIdea = typeof ideasTable.$inferInsert;
export type Role = typeof rolesTable.$inferSelect;
export type NewRole = typeof rolesTable.$inferInsert;
export type Application = typeof applicationsTable.$inferSelect;
export type NewApplication = typeof applicationsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  ideas: ideasTable,
  roles: rolesTable,
  applications: applicationsTable,
};
