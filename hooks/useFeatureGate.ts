import { useSession } from 'next-auth/react';

export const useFeatureGate = () => {
  const { data: session } = useSession();
  const tier = session?.user?.tier || 'FREE';

  const canAccessTeams = tier === 'ENTERPRISE';
  const canAccessPhases = tier === 'ENTERPRISE';
  const canAccessAI = tier === 'PREMIUM' || tier === 'ENTERPRISE';
  const canAccessUnlimitedCategories = tier === 'PREMIUM' || tier === 'ENTERPRISE';

  return {
    tier,
    canAccessTeams,
    canAccessPhases,
    canAccessAI,
    canAccessUnlimitedCategories
  };
};
