import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Role } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query; // teamId

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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

  const { email, name, role } = req.body;

  if (!email && !name) {
    return res.status(400).json({ error: "Email or name is required" });
  }

  // Find user by email or name
  let userToAdd;
  if (email) {
    userToAdd = await prisma.user.findUnique({
      where: { email: email.trim() }
    });
  } else if (name) {
    userToAdd = await prisma.user.findFirst({
      where: { name: name.trim() }
    });
  }

  if (!userToAdd) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if already a member
  const existingMember = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: userToAdd.id,
        teamId: String(id)
      }
    }
  });

  if (existingMember) {
    return res.status(409).json({ error: "User is already a member of this team" });
  }

  // Determine role
  let roleValue: Role = Role.MEMBER;
  if (role && typeof role === 'string') {
    const normalizedRole = role.toUpperCase();
    if (Object.values(Role).includes(normalizedRole as Role)) {
      roleValue = normalizedRole as Role;
    }
  }

  try {
    const newMember = await prisma.teamMember.create({
      data: {
        userId: userToAdd.id,
        teamId: String(id),
        role: roleValue
      }
    });
    return res.status(201).json(newMember);
  } catch (error) {
    console.error("Error adding team member:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
