
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ideasTable } from '../db/schema';
import { getIdeaById } from '../handlers/get_idea_by_id';
import { eq } from 'drizzle-orm';

describe('getIdeaById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return idea by id', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['JavaScript', 'TypeScript']
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test idea
    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Test Idea',
        description: 'A great idea for testing',
        owner_id: userId,
        development_stage: 'Concept',
        is_for_sale: true,
        price: '199.99',
        price_reasoning: 'Fair market value'
      })
      .returning()
      .execute();

    const ideaId = ideaResult[0].id;

    const result = await getIdeaById(ideaId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(ideaId);
    expect(result!.title).toEqual('Test Idea');
    expect(result!.description).toEqual('A great idea for testing');
    expect(result!.owner_id).toEqual(userId);
    expect(result!.development_stage).toEqual('Concept');
    expect(result!.is_for_sale).toEqual(true);
    expect(result!.price).toEqual(199.99);
    expect(typeof result!.price).toEqual('number');
    expect(result!.price_reasoning).toEqual('Fair market value');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should handle idea with null price', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['JavaScript']
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create idea without price
    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Free Idea',
        description: 'Not for sale',
        owner_id: userId,
        development_stage: 'MVP',
        is_for_sale: false
      })
      .returning()
      .execute();

    const ideaId = ideaResult[0].id;

    const result = await getIdeaById(ideaId);

    expect(result).not.toBeNull();
    expect(result!.price).toBeNull();
    expect(result!.is_for_sale).toEqual(false);
    expect(result!.price_reasoning).toBeNull();
  });

  it('should return null for non-existent idea', async () => {
    const nonExistentId = 999;

    const result = await getIdeaById(nonExistentId);

    expect(result).toBeNull();
  });

  it('should save idea to database correctly', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['JavaScript']
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test idea
    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Database Test Idea',
        description: 'Testing database storage',
        owner_id: userId,
        development_stage: 'Prototype',
        is_for_sale: true,
        price: '299.50',
        price_reasoning: 'Premium pricing'
      })
      .returning()
      .execute();

    const ideaId = ideaResult[0].id;

    // Query using handler
    const result = await getIdeaById(ideaId);

    // Verify database storage
    const directQuery = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, ideaId))
      .execute();

    expect(directQuery).toHaveLength(1);
    expect(directQuery[0].title).toEqual('Database Test Idea');
    expect(directQuery[0].price).toEqual('299.50'); // Stored as string
    expect(result!.price).toEqual(299.50); // Converted to number by handler
    expect(typeof result!.price).toEqual('number');
  });
});
