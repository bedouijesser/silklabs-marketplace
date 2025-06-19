
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type CreateIdeaInput, type Idea } from '../schema';

export const createIdea = async (input: CreateIdeaInput): Promise<Idea> => {
  try {
    // Insert idea record
    const result = await db.insert(ideasTable)
      .values({
        title: input.title,
        description: input.description,
        owner_id: input.owner_id,
        development_stage: input.development_stage,
        is_for_sale: input.is_for_sale ?? null, // Use nullish coalescing to preserve false values
        price: input.price ? input.price.toString() : null, // Convert number to string for numeric column
        price_reasoning: input.price_reasoning ?? null
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const idea = result[0];
    return {
      ...idea,
      price: idea.price ? parseFloat(idea.price) : null // Convert string back to number
    };
  } catch (error) {
    console.error('Idea creation failed:', error);
    throw error;
  }
};
