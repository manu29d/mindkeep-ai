import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (session.user.tier === SubscriptionTier.FREE) {
    return res.status(403).json({ error: "Upgrade to Premium to invite collaborators" });
  }

  const { id } = req.query;
  if (req.method === 'POST') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) return res.status(404).json({ error: "User not found" });

    await prisma.category.update({
      where: { id: String(id) },
      data: {
        collaborators: {
          connect: { id: userToInvite.id }
        }
      }
    });
    return res.status(200).json({ message: "Invited" });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
