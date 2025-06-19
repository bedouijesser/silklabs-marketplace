
import { z } from 'zod';

// Enums
export const developmentStageEnum = z.enum(['Concept', 'Prototype', 'MVP', 'Launched']);
export const compensationTypeEnum = z.enum(['Volunteer', 'Compensated']);
export const applicationStatusEnum = z.enum(['Pending', 'Accepted', 'Rejected']);

// User schema
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  bio: z.string().nullable(),
  skills: z.array(z.string()),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// User input schemas
export const updateUserInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string()).optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Idea schema
export const ideaSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  owner_id: z.number(),
  development_stage: developmentStageEnum,
  is_for_sale: z.boolean().nullable(),
  price: z.number().nullable(),
  price_reasoning: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Idea = z.infer<typeof ideaSchema>;

// Idea input schemas
export const createIdeaInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  owner_id: z.number(),
  development_stage: developmentStageEnum,
  is_for_sale: z.boolean().optional(),
  price: z.number().positive().optional(),
  price_reasoning: z.string().optional()
});

export type CreateIdeaInput = z.infer<typeof createIdeaInputSchema>;

// Role schema
export const roleSchema = z.object({
  id: z.number(),
  idea_id: z.number(),
  title: z.string(),
  description: z.string(),
  compensation_type: compensationTypeEnum,
  created_at: z.coerce.date()
});

export type Role = z.infer<typeof roleSchema>;

// Role input schemas
export const createRoleInputSchema = z.object({
  idea_id: z.number(),
  title: z.string().min(1),
  description: z.string().min(1),
  compensation_type: compensationTypeEnum
});

export type CreateRoleInput = z.infer<typeof createRoleInputSchema>;

// Application schema
export const applicationSchema = z.object({
  id: z.number(),
  role_id: z.number(),
  applicant_id: z.number(),
  motivation: z.string(),
  status: applicationStatusEnum,
  created_at: z.coerce.date()
});

export type Application = z.infer<typeof applicationSchema>;

// Application input schemas
export const createApplicationInputSchema = z.object({
  role_id: z.number(),
  applicant_id: z.number(),
  motivation: z.string().min(1)
});

export type CreateApplicationInput = z.infer<typeof createApplicationInputSchema>;
