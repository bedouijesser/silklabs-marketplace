
import { db } from '../db';
import { applicationsTable, usersTable, rolesTable } from '../db/schema';
import { type CreateApplicationInput, type Application } from '../schema';
import { eq } from 'drizzle-orm';

export const applyForRole = async (input: CreateApplicationInput): Promise<Application> => {
  try {
    // Verify that the applicant exists
    const applicant = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.applicant_id))
      .limit(1)
      .execute();

    if (applicant.length === 0) {
      throw new Error(`User with id ${input.applicant_id} not found`);
    }

    // Verify that the role exists
    const role = await db.select()
      .from(rolesTable)
      .where(eq(rolesTable.id, input.role_id))
      .limit(1)
      .execute();

    if (role.length === 0) {
      throw new Error(`Role with id ${input.role_id} not found`);
    }

    // Insert application record
    const result = await db.insert(applicationsTable)
      .values({
        role_id: input.role_id,
        applicant_id: input.applicant_id,
        motivation: input.motivation,
        status: 'Pending' // Default status as defined in schema
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Application creation failed:', error);
    throw error;
  }
};
