# Task 09: Collaborator Invitations

## Requirements
1.  **UI**: "Add a collaborator" button on TodoItem opens a modal.
2.  **Search**: Modal allows searching for a user by email.
3.  **Flow - User Exists**:
    - Search finds user in DB.
    - Click "Invite".
    - Creates an `Invitation` record.
    - Recipient sees invitation (e.g., in a Notification center or Sidebar).
    - Recipient accepts -> Added to `Todo.assignees`.
    - Recipient rejects -> Invitation marked rejected.
4.  **Flow - User Does Not Exist**:
    - Search returns no result.
    - UI asks "Send email invite?".
    - (Future: Send email).
5.  **Dashboard**:
    - Show Todos where user is Owner OR Collaborator (Assignee).
    - (Already implemented in `GET /api/todos` logic).

## Implementation Steps
1.  Update Prisma Schema: Add `Invitation` model.
2.  API: `GET /api/users/search`.
3.  API: `POST /api/invitations` (create).
4.  API: `POST /api/invitations/[id]/respond` (accept/reject).
5.  Frontend: `CollaboratorModal` component.
6.  Frontend: `InvitationsList` component (to accept invites).
7.  Integration: Connect `TodoItem` to `CollaboratorModal`.
