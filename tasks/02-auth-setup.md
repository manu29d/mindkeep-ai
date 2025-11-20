# Task 02: Authentication Setup

## Goal
Implement secure authentication using NextAuth.js and link it to the Prisma database.

## Requirements
- **Provider**: Google (primary) or Email (magic links).
- **Adapter**: Prisma Adapter to persist users.
- **Session**: Extend session to include `userId` and `subscriptionTier`.

## Implementation Steps

### 1. Dependencies
- Install packages: `npm install next-auth @next-auth/prisma-adapter`

### 2. Environment Variables
- Add to `.env`:
  - `NEXTAUTH_URL=http://localhost:3000`
  - `NEXTAUTH_SECRET` (generate one)
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

### 3. NextAuth Configuration (`pages/api/auth/[...nextauth].ts`)
- Configure `PrismaAdapter`.
- Configure `GoogleProvider`.
- **Callbacks**:
  - `session`: Inject `user.id` and `user.tier` into the session object. This is crucial for frontend permission checks.

### 4. Type Extensions (`types/next-auth.d.ts`)
- Extend the default `Session` type:
```typescript
import { DefaultSession } from "next-auth"
import { SubscriptionTier } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      tier: SubscriptionTier
    } & DefaultSession["user"]
  }
}
```

### 5. Frontend Integration
- Wrap `_app.tsx` with `SessionProvider`.
- Create a `Login` component/page.
- Protect routes: Redirect unauthenticated users to login.
