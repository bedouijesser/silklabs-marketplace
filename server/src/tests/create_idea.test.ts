
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ideasTable } from '../db/schema';
import { type CreateIdeaInput } from '../schema';
import { createIdea } from '../handlers/create_idea';
import { eq } from 'drizzle-orm';

describe('createIdea', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an idea with all fields', async () => {
    // Create a test user first
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

    const testInput: CreateIdeaInput = {
      title: 'Test Idea',
      description: 'A comprehensive test idea',
      owner_id: userId,
      development_stage: 'Concept',
      is_for_sale: true,
      price: 10000.50,
      price_reasoning: 'Based on market research'
    };

    const result = await createIdea(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Idea');
    expect(result.description).toEqual('A comprehensive test idea');
    expect(result.owner_id).toEqual(userId);
    expect(result.development_stage).toEqual('Concept');
    expect(result.is_for_sale).toEqual(true);
    expect(result.price).toEqual(10000.50);
    expect(typeof result.price).toEqual('number');
    expect(result.price_reasoning).toEqual('Based on market research');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create an idea with minimal fields', async () => {
    // Create a test user first
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: null,
        skills: []
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const testInput: CreateIdeaInput = {
      title: 'Minimal Idea',
      description: 'Just the basics',
      owner_id: userId,
      development_stage: 'MVP'
    };

    const result = await createIdea(testInput);

    expect(result.title).toEqual('Minimal Idea');
    expect(result.description).toEqual('Just the basics');
    expect(result.owner_id).toEqual(userId);
    expect(result.development_stage).toEqual('MVP');
    expect(result.is_for_sale).toBeNull();
    expect(result.price).toBeNull();
    expect(result.price_reasoning).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save idea to database', async () => {
    // Create a test user first
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['React']
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const testInput: CreateIdeaInput = {
      title: 'Database Test Idea',
      description: 'Testing database persistence',
      owner_id: userId,
      development_stage: 'Prototype',
      is_for_sale: false,
      price: 5000.25,
      price_reasoning: 'Prototype stage pricing'
    };

    const result = await createIdea(testInput);

    // Query the database to verify the idea was saved
    const ideas = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, result.id))
      .execute();

    expect(ideas).toHaveLength(1);
    const savedIdea = ideas[0];
    expect(savedIdea.title).toEqual('Database Test Idea');
    expect(savedIdea.description).toEqual('Testing database persistence');
    expect(savedIdea.owner_id).toEqual(userId);
    expect(savedIdea.development_stage).toEqual('Prototype');
    expect(savedIdea.is_for_sale).toEqual(false);
    expect(parseFloat(savedIdea.price!)).toEqual(5000.25);
    expect(savedIdea.price_reasoning).toEqual('Prototype stage pricing');
    expect(savedIdea.created_at).toBeInstanceOf(Date);
  });

  it('should handle different development stages', async () => {
    // Create a test user first
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: null,
        skills: []
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    const stages = ['Concept', 'Prototype', 'MVP', 'Launched'] as const;

    for (const stage of stages) {
      const testInput: CreateIdeaInput = {
        title: `${stage} Idea`,
        description: `An idea in ${stage} stage`,
        owner_id: userId,
        development_stage: stage
      };

      const result = await createIdea(testInput);
      expect(result.development_stage).toEqual(stage);
      expect(result.title).toEqual(`${stage} Idea`);
    }
  });
});
