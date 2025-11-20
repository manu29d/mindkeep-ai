import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "Invalid ID" });

  if (req.method === 'PUT') {
    const { title, completed, deadline } = req.body;
    const updated = await prisma.subTodo.update({
      where: { id },
      data: { title, completed, deadline: deadline ? new Date(deadline) : undefined }
    });
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.subTodo.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
