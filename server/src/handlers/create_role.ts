
import { db } from '../db';
import { rolesTable, ideasTable } from '../db/schema';
import { type CreateRoleInput, type Role } from '../schema';
import { eq } from 'drizzle-orm';

export const createRole = async (input: CreateRoleInput): Promise<Role> => {
  try {
    // Verify that the idea exists to prevent foreign key constraint violation
    const existingIdea = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, input.idea_id))
      .execute();

    if (existingIdea.length === 0) {
      throw new Error(`Idea with id ${input.idea_id} does not exist`);
    }

    // Insert role record
    const result = await db.insert(rolesTable)
      .values({
        idea_id: input.idea_id,
        title: input.title,
        description: input.description,
        compensation_type: input.compensation_type
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Role creation failed:', error);
    throw error;
  }
};
