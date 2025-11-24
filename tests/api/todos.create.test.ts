import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

const prismaPath = path.resolve(process.cwd(), 'lib/prisma.ts');
const authPath = path.resolve(process.cwd(), 'pages/api/auth/[...nextauth].ts');
const handlerPath = path.resolve(process.cwd(), 'pages/api/todos/index.ts');

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));

describe('POST /api/todos', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();

    vi.doMock(prismaPath, () => ({
      prisma: {
        todo: { create: vi.fn() },
      }
    }));

    vi.doMock(authPath, () => ({ authOptions: {} }));
  });

  it('creates a todo with a deadline', async () => {
    const { prisma } = await import(prismaPath) as any;
    const nextAuth = await import('next-auth/next') as any;

    nextAuth.getServerSession.mockResolvedValue({ user: { id: 'user-1' } });

    const deadlineDate = new Date('2025-12-01T00:00:00.000Z');

    prisma.todo.create.mockResolvedValue({
      id: 'todo-1',
      title: 'Task with deadline',
      description: 'desc',
      categoryId: 'cat-1',
      deadline: deadlineDate,
      ownerId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      timeSpent: 0,
      timerState: 'IDLE',
      lastStartedAt: null
    });

    const handlerModule = await import(handlerPath) as any;
    const handler = handlerModule.default;

    const req: any = {
      method: 'POST',
      body: { title: 'Task with deadline', categoryId: 'cat-1', deadline: deadlineDate.toISOString(), description: 'desc' }
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
    expect(jsonBody.title).toBe('Task with deadline');
    expect(jsonBody.categoryId).toBe('cat-1');
    expect(jsonBody.deadline).toBeDefined();
    expect(new Date(jsonBody.deadline).toISOString()).toBe(deadlineDate.toISOString());
  });

  it('creates a todo without a deadline', async () => {
    const { prisma } = await import(prismaPath) as any;
    const nextAuth = await import('next-auth/next') as any;

    nextAuth.getServerSession.mockResolvedValue({ user: { id: 'user-2' } });

    prisma.todo.create.mockResolvedValue({
      id: 'todo-2',
      title: 'Task no deadline',
      description: null,
      categoryId: 'cat-2',
      deadline: null,
      ownerId: 'user-2',
      createdAt: new Date(),
      updatedAt: new Date(),
      timeSpent: 0,
      timerState: 'IDLE',
      lastStartedAt: null
    });

    const handlerModule = await import(handlerPath) as any;
    const handler = handlerModule.default;

    const req: any = {
      method: 'POST',
      body: { title: 'Task no deadline', categoryId: 'cat-2' }
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
    expect(jsonBody.title).toBe('Task no deadline');
    expect(jsonBody.deadline).toBeNull();
  });
});
