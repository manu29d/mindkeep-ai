import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

const prismaPath = path.resolve(process.cwd(), 'lib/prisma.ts');
const authPath = path.resolve(process.cwd(), 'pages/api/auth/[...nextauth].ts');
const handlerPath = path.resolve(process.cwd(), 'pages/api/teams/[id]/members.ts');

// Use non-hoisted mocks inside lifecycle to avoid TDZ issues
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn()
}));

describe('POST /api/teams/[id]/members', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock prisma module (doMock avoids hoisting)
    vi.doMock(prismaPath, () => {
      const mock = {
        prisma: {
          team: { findUnique: vi.fn() },
          user: { findUnique: vi.fn(), findFirst: vi.fn() },
          teamMember: { findUnique: vi.fn(), create: vi.fn() }
        }
      };
      return mock;
    });

    // Mock authOptions module
    vi.doMock(authPath, () => ({ authOptions: {} }));
  });

  it('creates a team member and returns 201', async () => {
    const { prisma } = await import(prismaPath) as any;
    const nextAuth = await import('next-auth/next') as any;

    // Mock session as owner/admin
    nextAuth.getServerSession.mockResolvedValue({ user: { id: 'owner-id' } });

    // Team membership for the requester
    prisma.team.findUnique.mockResolvedValue({ members: [{ userId: 'owner-id', role: 'OWNER' }] });

    // User to add
    prisma.user.findUnique.mockResolvedValue({ id: 'new-id', email: 'new@x.com', name: 'New User' });

    // Not already a member
    prisma.teamMember.findUnique.mockResolvedValue(null);

    // Creation result
    prisma.teamMember.create.mockResolvedValue({ id: 'tm-1', userId: 'new-id', teamId: 'team-1', role: 'MEMBER' });

    const handlerModule = await import(handlerPath) as any;
    const handler = handlerModule.default;

    // Minimal mock request/response
    const req: any = {
      method: 'POST',
      query: { id: 'team-1' },
      body: { email: 'new@x.com', role: 'MEMBER' }
    };

    let statusCode = 200;
    let jsonBody: any = null;
    const res: any = {
      status(code: number) { statusCode = code; return this; },
      json(body: any) { jsonBody = body; return this; },
      setHeader() {},
      end() { return this; }
    };

    await handler(req, res);

    expect(statusCode).toBe(201);
    expect(jsonBody).toMatchObject({ id: 'tm-1', userId: 'new-id', teamId: 'team-1' });
  });
});
