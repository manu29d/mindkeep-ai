import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: "Invalid ID" });

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) return res.status(404).json({ error: "Invitation not found" });
  if (invitation.email !== session.user.email) return res.status(403).json({ error: "Forbidden" });

  if (req.method === 'POST') {
    const { action } = req.body;
    if (!['accept', 'reject'].includes(action)) return res.status(400).json({ error: "Invalid action" });

    const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

    await prisma.invitation.update({
      where: { id },
      data: { status }
    });

    if (action === 'accept' && invitation.todoId) {
      // Add to assignees
      await prisma.todo.update({
        where: { id: invitation.todoId },
        data: { assignees: { connect: { id: session.user.id } } }
      });
    }

    return res.status(200).json({ message: 'Updated' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}