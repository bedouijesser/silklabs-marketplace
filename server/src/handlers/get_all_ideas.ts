
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type Idea } from '../schema';

export const getAllIdeas = async (): Promise<Idea[]> => {
  try {
    const results = await db.select()
      .from(ideasTable)
      .execute();

    return results.map(idea => ({
      ...idea,
      price: idea.price ? parseFloat(idea.price) : null
    }));
  } catch (error) {
    console.error('Failed to get all ideas:', error);
    throw error;
  }
};
