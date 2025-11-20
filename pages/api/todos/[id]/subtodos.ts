import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  // Tier Check
  if (session.user.tier === SubscriptionTier.FREE) {
    return res.status(403).json({ error: "Upgrade to Premium to use Sub-tasks" });
  }

  const { id } = req.query; // todoId
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "Invalid ID" });

  if (req.method === 'POST') {
    const { title, deadline } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });

    const subTodo = await prisma.subTodo.create({
      data: {
        title,
        deadline: deadline ? new Date(deadline) : null,
        todoId: id
      }
    });
    return res.status(201).json(subTodo);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
