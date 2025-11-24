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
    // Accept either an email or a plain name. If the user doesn't exist, create them.
    const { email, role } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: "Identifier (name or email) required" });

    const identifier = email.trim();

    let userToAdd = null;

    if (identifier.includes('@')) {
      userToAdd = await prisma.user.findUnique({ where: { email: identifier } });
    } else {
      // try to find by exact name match
      userToAdd = await prisma.user.findFirst({ where: { name: identifier } });
    }

    if (!userToAdd) {
      // create a lightweight user record; set email only if identifier looks like an email
      userToAdd = await prisma.user.create({ data: { name: identifier || undefined, email: identifier.includes('@') ? identifier : null } });
    }

    // If the user is already a member of the team, return it
    const existing = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId: userToAdd.id, teamId: String(id) } } }).catch(() => null);
    if (existing) return res.status(200).json(existing);

    // Normalize role value to Prisma Role enum
    let roleValue: Role = Role.MEMBER;
    if (role && typeof role === 'string') {
      const up = role.toString().toUpperCase();
      if ((Object.values(Role) as string[]).includes(up)) {
        roleValue = up as Role;
      }
    }

    // create member via nested relation on team to avoid referencing prisma.teamMember client directly
    const updatedTeam = await prisma.team.update({
      where: { id: String(id) },
      data: {
        members: {
          create: {
            user: { connect: { id: userToAdd.id } },
            role: roleValue
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
