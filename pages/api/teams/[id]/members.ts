import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query; // teamId

  // Check if user is admin/owner of the team
  const team = await prisma.team.findUnique({
    where: { id: String(id) },
    include: {
      members: {
        where: { userId: session.user.id }
      }
    }
  });

  const membership = team?.members?.[0];

  if (!membership || (membership.role !== Role.OWNER && membership.role !== Role.ADMIN)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === 'POST') {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: "User not found" });

    // create member via nested relation on team to avoid referencing prisma.teamMember client directly
    const updatedTeam = await prisma.team.update({
      where: { id: String(id) },
      data: {
        members: {
          create: {
            user: { connect: { id: userToAdd.id } },
            role: role || Role.MEMBER
          }
        }
      },
      include: { members: true }
    });

    const createdMember = updatedTeam.members.find(m => m.userId === userToAdd.id);
    return res.status(201).json(createdMember);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
