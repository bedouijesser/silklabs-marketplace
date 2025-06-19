
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type Idea } from '../schema';
import { eq } from 'drizzle-orm';

export const getIdeaById = async (id: number): Promise<Idea | null> => {
  try {
    const results = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const idea = results[0];
    return {
      ...idea,
      price: idea.price ? parseFloat(idea.price) : null
    };
  } catch (error) {
    console.error('Get idea by ID failed:', error);
    throw error;
  }
};
