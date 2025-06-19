
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput } from '../schema';
import { updateUserProfile } from '../handlers/update_user_profile';
import { eq } from 'drizzle-orm';

describe('updateUserProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update user name', async () => {
    // Create test user
    const createResult = await db.insert(usersTable)
      .values({
        name: 'Original Name',
        email: 'test@example.com',
        bio: 'Original bio',
        skills: ['JavaScript', 'Python']
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    const updateInput: UpdateUserInput = {
      id: userId,
      name: 'Updated Name'
    };

    const result = await updateUserProfile(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.name).toEqual('Updated Name');
    expect(result.email).toEqual('test@example.com');
    expect(result.bio).toEqual('Original bio');
    expect(result.skills).toEqual(['JavaScript', 'Python']);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update user bio', async () => {
    // Create test user
    const createResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Original bio',
        skills: ['React']
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    const updateInput: UpdateUserInput = {
      id: userId,
      bio: 'Updated bio with new information'
    };

    const result = await updateUserProfile(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.name).toEqual('Test User');
    expect(result.bio).toEqual('Updated bio with new information');
    expect(result.skills).toEqual(['React']);
  });

  it('should update user skills', async () => {
    // Create test user
    const createResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: null,
        skills: ['JavaScript']
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    const updateInput: UpdateUserInput = {
      id: userId,
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js']
    };

    const result = await updateUserProfile(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.name).toEqual('Test User');
    expect(result.bio).toBeNull();
    expect(result.skills).toEqual(['JavaScript', 'TypeScript', 'React', 'Node.js']);
  });

  it('should update multiple fields at once', async () => {
    // Create test user
    const createResult = await db.insert(usersTable)
      .values({
        name: 'Original Name',
        email: 'test@example.com',
        bio: 'Original bio',
        skills: ['Python']
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    const updateInput: UpdateUserInput = {
      id: userId,
      name: 'Updated Name',
      bio: 'Updated bio',
      skills: ['Python', 'Django', 'PostgreSQL']
    };

    const result = await updateUserProfile(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.name).toEqual('Updated Name');
    expect(result.bio).toEqual('Updated bio');
    expect(result.skills).toEqual(['Python', 'Django', 'PostgreSQL']);
    expect(result.email).toEqual('test@example.com');
  });

  it('should set bio to null when explicitly provided', async () => {
    // Create test user with existing bio
    const createResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Existing bio',
        skills: ['JavaScript']
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    const updateInput: UpdateUserInput = {
      id: userId,
      bio: null
    };

    const result = await updateUserProfile(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.bio).toBeNull();
    expect(result.name).toEqual('Test User');
    expect(result.skills).toEqual(['JavaScript']);
  });

  it('should save changes to database', async () => {
    // Create test user
    const createResult = await db.insert(usersTable)
      .values({
        name: 'Original Name',
        email: 'test@example.com',
        bio: 'Original bio',
        skills: ['JavaScript']
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    const updateInput: UpdateUserInput = {
      id: userId,
      name: 'Database Test Name',
      skills: ['JavaScript', 'SQL']
    };

    await updateUserProfile(updateInput);

    // Verify changes persisted to database
    const dbUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(dbUsers).toHaveLength(1);
    expect(dbUsers[0].name).toEqual('Database Test Name');
    expect(dbUsers[0].bio).toEqual('Original bio');
    expect(dbUsers[0].skills).toEqual(['JavaScript', 'SQL']);
  });

  it('should throw error for non-existent user', async () => {
    const updateInput: UpdateUserInput = {
      id: 99999,
      name: 'New Name'
    };

    await expect(updateUserProfile(updateInput)).rejects.toThrow(/User with id 99999 not found/i);
  });

  it('should handle empty skills array', async () => {
    // Create test user
    const createResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: null,
        skills: ['JavaScript', 'Python']
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    const updateInput: UpdateUserInput = {
      id: userId,
      skills: []
    };

    const result = await updateUserProfile(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.skills).toEqual([]);
  });
});
