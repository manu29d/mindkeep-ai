import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === 'GET') {
    const invitations = await prisma.invitation.findMany({
      where: { email: session.user.email },
      include: { todo: { include: { owner: true } } }
    });
    return res.status(200).json(invitations);
  }

  if (req.method === 'POST') {
    const { email, todoId } = req.body;
    if (!email || !todoId) return res.status(400).json({ error: "Email and todoId required" });

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if already invited or assigned
    const existing = await prisma.invitation.findFirst({
      where: { email, todoId, status: { not: 'REJECTED' } }
    });
    if (existing) return res.status(400).json({ error: "Already invited" });

    const invitation = await prisma.invitation.create({
      data: { email, senderId: session.user.id, todoId }
    });
    return res.status(201).json(invitation);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}