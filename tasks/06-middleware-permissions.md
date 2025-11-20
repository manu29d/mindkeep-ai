# Task 06: Middleware & Permissions

## Goal
Create a reusable permission layer to enforce tier limits and security across API routes.

## Implementation

### 1. Permission Utility (`lib/permissions.ts`)
Create helper functions to check capabilities:

```typescript
export const canCreateSubtasks = (tier: SubscriptionTier) => {
  return tier === 'PREMIUM' || tier === 'ENTERPRISE';
};

export const canInviteCollaborators = (tier: SubscriptionTier) => {
  return tier === 'PREMIUM' || tier === 'ENTERPRISE';
};

export const canCreateTeams = (tier: SubscriptionTier) => {
  return tier === 'ENTERPRISE';
};

export const canUsePhases = (tier: SubscriptionTier) => {
  return tier === 'ENTERPRISE';
};
```

### 2. API Middleware / Wrapper
Since Next.js API routes are functions, create a wrapper or use simple checks at the top of handlers.

```typescript
// Example usage in API route
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { canCreateTeams } from "@/lib/permissions";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === 'POST') {
    if (!canCreateTeams(session.user.tier)) {
      return res.status(403).json({ error: "Upgrade to Enterprise to create teams" });
    }
    // ... proceed
  }
}
```

### 3. Frontend Gates
- Create a `FeatureGate` component to hide/disable UI elements based on the user's tier from the session.
- Example: Disable the "Add Subtask" button if user is FREE.
