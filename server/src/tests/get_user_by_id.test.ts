
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUserById } from '../handlers/get_user_by_id';

describe('getUserById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user when user exists', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Software developer',
        skills: ['JavaScript', 'TypeScript', 'React']
      })
      .returning()
      .execute();

    const createdUser = userResult[0];
    const result = await getUserById(createdUser.id);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(createdUser.id);
    expect(result!.name).toBe('John Doe');
    expect(result!.email).toBe('john@example.com');
    expect(result!.bio).toBe('Software developer');
    expect(result!.skills).toEqual(['JavaScript', 'TypeScript', 'React']);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when user does not exist', async () => {
    const result = await getUserById(99999);

    expect(result).toBeNull();
  });

  it('should handle user with null bio', async () => {
    // Create test user with null bio
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Jane Smith',
        email: 'jane@example.com',
        bio: null,
        skills: ['Python', 'Django']
      })
      .returning()
      .execute();

    const createdUser = userResult[0];
    const result = await getUserById(createdUser.id);

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Jane Smith');
    expect(result!.bio).toBeNull();
    expect(result!.skills).toEqual(['Python', 'Django']);
  });

  it('should handle user with empty skills array', async () => {
    // Create test user with empty skills
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Bob Wilson',
        email: 'bob@example.com',
        bio: 'New to programming',
        skills: []
      })
      .returning()
      .execute();

    const createdUser = userResult[0];
    const result = await getUserById(createdUser.id);

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Bob Wilson');
    expect(result!.skills).toEqual([]);
    expect(Array.isArray(result!.skills)).toBe(true);
  });
});
