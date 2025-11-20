import { SubscriptionTier } from "@prisma/client";

export const canCreateSubtasks = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.ENTERPRISE;
};

export const canInviteCollaborators = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.ENTERPRISE;
};

export const canUseAI = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.ENTERPRISE;
};

export const canCreateTeams = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.ENTERPRISE;
};

export const canUsePhases = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.ENTERPRISE;
};

export const canUseAIPlanning = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.ENTERPRISE;
};
