
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ideasTable, rolesTable } from '../db/schema';
import { type CreateRoleInput } from '../schema';
import { createRole } from '../handlers/create_role';
import { eq } from 'drizzle-orm';

describe('createRole', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a role', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['JavaScript', 'React']
      })
      .returning()
      .execute();

    const user = userResult[0];

    // Create prerequisite idea
    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Test Idea',
        description: 'A test idea',
        owner_id: user.id,
        development_stage: 'Concept',
        is_for_sale: false
      })
      .returning()
      .execute();

    const idea = ideaResult[0];

    // Test input
    const testInput: CreateRoleInput = {
      idea_id: idea.id,
      title: 'Frontend Developer',
      description: 'Looking for a React developer to build the UI',
      compensation_type: 'Compensated'
    };

    const result = await createRole(testInput);

    // Basic field validation
    expect(result.idea_id).toEqual(idea.id);
    expect(result.title).toEqual('Frontend Developer');
    expect(result.description).toEqual('Looking for a React developer to build the UI');
    expect(result.compensation_type).toEqual('Compensated');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save role to database', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['JavaScript', 'React']
      })
      .returning()
      .execute();

    const user = userResult[0];

    // Create prerequisite idea
    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Test Idea',
        description: 'A test idea',
        owner_id: user.id,
        development_stage: 'MVP',
        is_for_sale: true,
        price: '100.00',
        price_reasoning: 'Fair price for the idea'
      })
      .returning()
      .execute();

    const idea = ideaResult[0];

    const testInput: CreateRoleInput = {
      idea_id: idea.id,
      title: 'Backend Developer',
      description: 'Need someone to build the API',
      compensation_type: 'Volunteer'
    };

    const result = await createRole(testInput);

    // Query database to verify role was saved
    const roles = await db.select()
      .from(rolesTable)
      .where(eq(rolesTable.id, result.id))
      .execute();

    expect(roles).toHaveLength(1);
    expect(roles[0].idea_id).toEqual(idea.id);
    expect(roles[0].title).toEqual('Backend Developer');
    expect(roles[0].description).toEqual('Need someone to build the API');
    expect(roles[0].compensation_type).toEqual('Volunteer');
    expect(roles[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when idea does not exist', async () => {
    const testInput: CreateRoleInput = {
      idea_id: 999, // Non-existent idea
      title: 'Designer',
      description: 'Need a UI/UX designer',
      compensation_type: 'Compensated'
    };

    await expect(createRole(testInput)).rejects.toThrow(/Idea with id 999 does not exist/i);
  });

  it('should handle different compensation types', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: null,
        skills: []
      })
      .returning()
      .execute();

    const user = userResult[0];

    // Create prerequisite idea
    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Test Idea',
        description: 'A test idea',
        owner_id: user.id,
        development_stage: 'Launched'
      })
      .returning()
      .execute();

    const idea = ideaResult[0];

    // Test Volunteer compensation type
    const volunteerInput: CreateRoleInput = {
      idea_id: idea.id,
      title: 'Marketing Volunteer',
      description: 'Help with marketing efforts',
      compensation_type: 'Volunteer'
    };

    const volunteerResult = await createRole(volunteerInput);
    expect(volunteerResult.compensation_type).toEqual('Volunteer');

    // Test Compensated compensation type
    const compensatedInput: CreateRoleInput = {
      idea_id: idea.id,
      title: 'Product Manager',
      description: 'Lead product development',
      compensation_type: 'Compensated'
    };

    const compensatedResult = await createRole(compensatedInput);
    expect(compensatedResult.compensation_type).toEqual('Compensated');
  });
});
