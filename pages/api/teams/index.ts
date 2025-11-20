import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { SubscriptionTier, Role } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === 'GET') {
    const teams = await prisma.team.findMany({
      where: {
        members: { some: { userId: session.user.id } }
      },
      include: { members: { include: { user: true } } }
    });
    return res.status(200).json(teams);
  }

  if (req.method === 'POST') {
    if (session.user.tier !== SubscriptionTier.ENTERPRISE) {
      return res.status(403).json({ error: "Upgrade to Enterprise to create teams" });
    }

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId: session.user.id,
            role: Role.OWNER
          }
        }
      }
    });
    return res.status(201).json(team);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
