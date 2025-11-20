import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === 'GET') {
    const { categoryId } = req.query;
    
    const where: Prisma.TodoWhereInput = {
      OR: [
        { ownerId: session.user.id },
        { assignees: { some: { id: session.user.id } } }
      ]
    };

    if (categoryId) where.categoryId = String(categoryId);
    
    const todos = await prisma.todo.findMany({
      where,
      include: { subTodos: true, attachments: true }
    });
    return res.status(200).json(todos);
  }

  if (req.method === 'POST') {
    const { title, categoryId, deadline, description } = req.body;
    if (!title || !categoryId) return res.status(400).json({ error: "Title and Category ID required" });

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        categoryId,
        deadline: deadline ? new Date(deadline) : null,
        ownerId: session.user.id
      }
    });
    return res.status(201).json(todo);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
