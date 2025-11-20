import { defineConfig } from 'cypress'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      on('task', {
        upgradeUserToEnterprise(email: string) {
          return prisma.user.update({
            where: { email },
            data: { tier: 'ENTERPRISE' }
          })
        }
      })
    },
  },
})