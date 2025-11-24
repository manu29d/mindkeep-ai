import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

const prismaPath = path.resolve(process.cwd(), 'lib/prisma.ts');
const authPath = path.resolve(process.cwd(), 'pages/api/auth/[...nextauth].ts');
const handlerPath = path.resolve(process.cwd(), 'pages/api/categories/index.ts');

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));

describe('POST /api/categories with teamId', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();

    vi.doMock(prismaPath, () => ({
      prisma: {
        category: { create: vi.fn() }
      }
    }));

    vi.doMock(authPath, () => ({ authOptions: {} }));
  });

  it('creates a category for a team and returns 201', async () => {
    const { prisma } = await import(prismaPath) as any;
    const nextAuth = await import('next-auth/next') as any;

    nextAuth.getServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    prisma.category.create.mockResolvedValue({
      id: 'cat-1',
      title: 'Team Cat',
      color: 'bg-red',
      description: 'desc',
      deadline: null,
      ownerId: 'user-1',
      teamId: 'team-1',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const handlerModule = await import(handlerPath) as any;
    const handler = handlerModule.default;

    const req: any = {
      method: 'POST',
      body: { title: 'Team Cat', teamId: 'team-1', color: 'bg-red', description: 'desc' }
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
    expect(jsonBody.teamId).toBe('team-1');
    expect(jsonBody.ownerId).toBe('user-1');
  });
});
