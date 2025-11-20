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
