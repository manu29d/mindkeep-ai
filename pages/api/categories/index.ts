import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === 'GET') {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { collaborators: { some: { id: session.user.id } } }
        ]
      },
      include: { phases: true }
    });
    return res.status(200).json(categories);
  }

  if (req.method === 'POST') {
    const { title, color, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const category = await prisma.category.create({
      data: {
        title,
        color: color || "bg-white",
        description,
        ownerId: session.user.id
      }
    });
    return res.status(201).json(category);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
