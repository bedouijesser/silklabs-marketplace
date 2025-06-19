
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ideasTable, rolesTable, applicationsTable } from '../db/schema';
import { type CreateApplicationInput } from '../schema';
import { applyForRole } from '../handlers/apply_for_role';
import { eq } from 'drizzle-orm';

describe('applyForRole', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an application', async () => {
    // Create prerequisite data
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

    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Test Idea',
        description: 'A test idea',
        owner_id: userId,
        development_stage: 'Concept'
      })
      .returning()
      .execute();

    const ideaId = ideaResult[0].id;

    const roleResult = await db.insert(rolesTable)
      .values({
        idea_id: ideaId,
        title: 'Frontend Developer',
        description: 'Build the frontend',
        compensation_type: 'Compensated'
      })
      .returning()
      .execute();

    const roleId = roleResult[0].id;

    // Test input with actual IDs
    const input: CreateApplicationInput = {
      role_id: roleId,
      applicant_id: userId,
      motivation: 'I am passionate about this project and have the relevant skills.'
    };

    const result = await applyForRole(input);

    // Basic field validation
    expect(result.role_id).toEqual(roleId);
    expect(result.applicant_id).toEqual(userId);
    expect(result.motivation).toEqual(input.motivation);
    expect(result.status).toEqual('Pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save application to database', async () => {
    // Create prerequisite data
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

    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Test Idea',
        description: 'A test idea',
        owner_id: userId,
        development_stage: 'MVP'
      })
      .returning()
      .execute();

    const roleResult = await db.insert(rolesTable)
      .values({
        idea_id: ideaResult[0].id,
        title: 'Backend Developer',
        description: 'Build the backend',
        compensation_type: 'Volunteer'
      })
      .returning()
      .execute();

    const input: CreateApplicationInput = {
      role_id: roleResult[0].id,
      applicant_id: userId,
      motivation: 'I want to contribute to this project.'
    };

    const result = await applyForRole(input);

    // Verify in database
    const applications = await db.select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, result.id))
      .execute();

    expect(applications).toHaveLength(1);
    expect(applications[0].role_id).toEqual(input.role_id);
    expect(applications[0].applicant_id).toEqual(input.applicant_id);
    expect(applications[0].motivation).toEqual(input.motivation);
    expect(applications[0].status).toEqual('Pending');
    expect(applications[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent applicant', async () => {
    // Create role without applicant
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Owner User',
        email: 'owner@example.com',
        bio: 'Owner bio',
        skills: ['Management']
      })
      .returning()
      .execute();

    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Test Idea',
        description: 'A test idea',
        owner_id: userResult[0].id,
        development_stage: 'Launched'
      })
      .returning()
      .execute();

    const roleResult = await db.insert(rolesTable)
      .values({
        idea_id: ideaResult[0].id,
        title: 'Developer',
        description: 'Develop the app',
        compensation_type: 'Compensated'
      })
      .returning()
      .execute();

    const input: CreateApplicationInput = {
      role_id: roleResult[0].id,
      applicant_id: 99999, // Non-existent user
      motivation: 'I want to help.'
    };

    await expect(applyForRole(input)).rejects.toThrow(/User with id 99999 not found/i);
  });

  it('should throw error for non-existent role', async () => {
    // Create user without role
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Applicant User',
        email: 'applicant@example.com',
        bio: 'Applicant bio',
        skills: ['Coding']
      })
      .returning()
      .execute();

    const input: CreateApplicationInput = {
      role_id: 99999, // Non-existent role
      applicant_id: userResult[0].id,
      motivation: 'I want to contribute.'
    };

    await expect(applyForRole(input)).rejects.toThrow(/Role with id 99999 not found/i);
  });

  it('should handle different compensation types', async () => {
    // Create user and idea
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['Design']
      })
      .returning()
      .execute();

    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Design Project',
        description: 'A design project',
        owner_id: userResult[0].id,
        development_stage: 'Prototype'
      })
      .returning()
      .execute();

    // Create volunteer role
    const volunteerRoleResult = await db.insert(rolesTable)
      .values({
        idea_id: ideaResult[0].id,
        title: 'Volunteer Designer',
        description: 'Design for free',
        compensation_type: 'Volunteer'
      })
      .returning()
      .execute();

    const input: CreateApplicationInput = {
      role_id: volunteerRoleResult[0].id,
      applicant_id: userResult[0].id,
      motivation: 'I want to volunteer for this cause.'
    };

    const result = await applyForRole(input);

    expect(result.role_id).toEqual(volunteerRoleResult[0].id);
    expect(result.applicant_id).toEqual(userResult[0].id);
    expect(result.motivation).toEqual(input.motivation);
    expect(result.status).toEqual('Pending');
  });

  it('should handle different development stages', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        skills: ['Marketing']
      })
      .returning()
      .execute();

    // Create idea in Launched stage
    const ideaResult = await db.insert(ideasTable)
      .values({
        title: 'Launched App',
        description: 'An already launched app',
        owner_id: userResult[0].id,
        development_stage: 'Launched'
      })
      .returning()
      .execute();

    const roleResult = await db.insert(rolesTable)
      .values({
        idea_id: ideaResult[0].id,
        title: 'Marketing Specialist',
        description: 'Help with marketing',
        compensation_type: 'Compensated'
      })
      .returning()
      .execute();

    const input: CreateApplicationInput = {
      role_id: roleResult[0].id,
      applicant_id: userResult[0].id,
      motivation: 'I have experience marketing launched products.'
    };

    const result = await applyForRole(input);

    expect(result.role_id).toEqual(roleResult[0].id);
    expect(result.applicant_id).toEqual(userResult[0].id);
    expect(result.status).toEqual('Pending');
  });
});
