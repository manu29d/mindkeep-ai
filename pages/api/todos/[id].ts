import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "Invalid ID" });

  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  
  if (req.method === 'PUT') {
    const { title, description, completed, deadline, categoryId, phaseId, timerState, timeSpent, lastStartedAt, assigneeIds } = req.body;
    
    const data: Prisma.TodoUpdateInput = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (completed !== undefined) {
        data.completed = completed;
        if (completed) data.completedAt = new Date();
        else data.completedAt = null;
    }
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (categoryId !== undefined) data.category = { connect: { id: categoryId } };
    if (phaseId !== undefined) {
        if (phaseId === null) {
            data.phase = { disconnect: true };
        } else {
            data.phase = { connect: { id: phaseId } };
        }
    }
    
    if (timerState !== undefined) data.timerState = timerState;
    if (timeSpent !== undefined) data.timeSpent = timeSpent;
    if (lastStartedAt !== undefined) data.lastStartedAt = lastStartedAt;

    if (assigneeIds !== undefined) {
        data.assignees = {
            set: assigneeIds.map((id: string) => ({ id }))
        };
    }

    const updated = await prisma.todo.update({
      where: { id },
      data,
      include: { assignees: true, subTodos: true, attachments: true }
    });
    return res.status(200).json({
      ...updated,
      createdAt: updated.createdAt.getTime(),
      completedAt: updated.completedAt ? updated.completedAt.getTime() : undefined,
      assigneeIds: updated.assignees.map(a => a.id),
      lastStartedAt: updated.lastStartedAt ? Number(updated.lastStartedAt) : null,
      subTodos: updated.subTodos || [],
      attachments: updated.attachments || []
    });
  }

  if (req.method === 'DELETE') {
    if (todo.ownerId !== session.user.id) return res.status(403).json({ error: "Forbidden" });
    await prisma.todo.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
