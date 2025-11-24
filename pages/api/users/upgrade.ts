import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { SubscriptionTier } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { tier } = req.body as { tier?: string };
  if (!tier || !['FREE', 'PREMIUM', 'ENTERPRISE'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { tier: tier as SubscriptionTier }
    });

    return res.status(200).json({ id: updated.id, tier: updated.tier });
  } catch (error) {
    console.error('Upgrade API error', error);
    return res.status(500).json({ error: 'Failed to update tier' });
  }
}
