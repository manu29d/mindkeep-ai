# Task 01: Database Schema Design

## Goal
Design and implement the Prisma schema to support the 3-tier application structure (Free, Premium, Enterprise).

## Requirements
- **User Management**: Support for NextAuth.js adapters.
- **Tiers**: `FREE`, `PREMIUM`, `ENTERPRISE`.
- **Core Data**: Categories, Todos, SubTodos, Attachments.
- **Enterprise Data**: Teams, Phases.

## Schema Specification (`prisma/schema.prisma`)

### Enums
```prisma
enum SubscriptionTier {
  FREE
  PREMIUM
  ENTERPRISE
}

enum TimerState {
  IDLE
  RUNNING
  PAUSED
  STOPPED
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}

enum AttachmentType {
  LINK
  FILE
}
```

### Models

#### User & Auth (NextAuth Standard)
- `User`: id, name, email, image, **tier** (default: FREE), createdAt, updatedAt.
- `Account`, `Session`, `VerificationToken`: Standard NextAuth models.

#### Organization (Enterprise/Collaboration)
- `Team`: id, name, createdAt, updatedAt.
- `TeamMember`: id, userId, teamId, role.

#### Productivity Core
- `Category`:
  - id, title, color, description.
  - ownerId (User).
  - teamId (optional, for Enterprise).
  - phases (relation to Phase).
  - todos (relation to Todo).
  - collaborators (Many-to-Many with User for Premium sharing).
  
- `Phase` (Enterprise):
  - id, title, deadline, categoryId.

- `Todo`:
  - id, title, description, completed, completedAt.
  - deadline, createdAt, updatedAt.
  - **Timer Fields**: timeSpent (int), timerState (Enum), lastStartedAt (BigInt/DateTime).
  - categoryId, phaseId (optional).
  - ownerId (User).
  - assignees (Many-to-Many with User for Enterprise).
  - subTodos (relation).
  - attachments (relation).

- `SubTodo` (Premium):
  - id, title, completed, deadline, todoId.

- `Attachment`:
  - id, name, url, type (Enum), todoId (optional), categoryId (optional).

## Action Items
1.  Delete existing `User` and `Post` models in `prisma/schema.prisma`.
2.  Add the generator and datasource blocks (keep existing).
3.  Implement the models defined above.
4.  Run `npx prisma format` to validate.
5.  Run `npx prisma migrate dev --name init_schema` to apply changes.
