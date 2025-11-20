import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === 'GET') {
    const { email } = req.query;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: "Email required" });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    return res.status(200).json({ user });
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}