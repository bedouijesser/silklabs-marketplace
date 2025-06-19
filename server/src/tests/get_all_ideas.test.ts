
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ideasTable } from '../db/schema';
import { getAllIdeas } from '../handlers/get_all_ideas';

describe('getAllIdeas', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all ideas', async () => {
    // Create test user
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

    // Create test ideas
    await db.insert(ideasTable)
      .values([
        {
          title: 'First Idea',
          description: 'First test idea',
          owner_id: userId,
          development_stage: 'Concept',
          is_for_sale: true,
          price: '19.99',
          price_reasoning: 'Fair price for concept'
        },
        {
          title: 'Second Idea',
          description: 'Second test idea',
          owner_id: userId,
          development_stage: 'MVP',
          is_for_sale: false
        }
      ])
      .execute();

    const ideas = await getAllIdeas();

    expect(ideas).toHaveLength(2);
    expect(ideas[0].title).toEqual('First Idea');
    expect(ideas[0].description).toEqual('First test idea');
    expect(ideas[0].development_stage).toEqual('Concept');
    expect(ideas[0].is_for_sale).toEqual(true);
    expect(ideas[0].price).toEqual(19.99);
    expect(typeof ideas[0].price).toEqual('number');
    expect(ideas[0].price_reasoning).toEqual('Fair price for concept');

    expect(ideas[1].title).toEqual('Second Idea');
    expect(ideas[1].is_for_sale).toEqual(false);
    expect(ideas[1].price).toBeNull();
  });

  it('should return empty array when no ideas exist', async () => {
    const ideas = await getAllIdeas();

    expect(ideas).toHaveLength(0);
  });

  it('should handle numeric price conversion correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        skills: ['JavaScript']
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create idea with price
    await db.insert(ideasTable)
      .values({
        title: 'Priced Idea',
        description: 'An idea with a price',
        owner_id: userId,
        development_stage: 'Launched',
        is_for_sale: true,
        price: '199.99'
      })
      .execute();

    const ideas = await getAllIdeas();

    expect(ideas).toHaveLength(1);
    expect(ideas[0].price).toEqual(199.99);
    expect(typeof ideas[0].price).toEqual('number');
  });

  it('should handle null price correctly', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        skills: ['JavaScript']
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create idea without price
    await db.insert(ideasTable)
      .values({
        title: 'Free Idea',
        description: 'An idea without a price',
        owner_id: userId,
        development_stage: 'Prototype',
        is_for_sale: false
      })
      .execute();

    const ideas = await getAllIdeas();

    expect(ideas).toHaveLength(1);
    expect(ideas[0].price).toBeNull();
  });
});
