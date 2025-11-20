import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (session.user.tier !== SubscriptionTier.ENTERPRISE) {
    return res.status(403).json({ error: "Upgrade to Enterprise to use Phases" });
  }

  const { id } = req.query; // categoryId

  if (req.method === 'POST') {
    const { title, deadline } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });

    const phase = await prisma.phase.create({
      data: {
        title,
        deadline: deadline ? new Date(deadline) : null,
        categoryId: String(id)
      }
    });
    return res.status(201).json(phase);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
