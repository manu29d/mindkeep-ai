# Task 08: Hide Premium Features in UI

## Goal
Hide or disable UI elements for features that are not available in the user's current subscription tier (Free, Premium, Enterprise).

## Context
- **Free Tier**: Basic features only.
- **Premium Tier**: Adds AI features, unlimited categories.
- **Enterprise Tier**: Adds Teams, Phases, Advanced Analytics.

## Requirements

### 1. Identify User Tier
- Ensure the frontend has access to the user's `tier` (e.g., via `useSession` or `TodoContext`).

### 2. Hide/Disable Features
- **Teams**:
  - Hide "Teams" section in Sidebar for non-Enterprise users.
  - Hide "Assign to Team" in Category Modal.
- **Phases**:
  - Hide "Add Phase" button in Category Board for non-Enterprise users.
- **AI Features**:
  - Disable/Hide "AI Auto-Plan" in New Category Modal for Free users.
  - Disable/Hide "Enrich with AI" (Subtasks) for Free users.

### 3. Implementation Strategy
- Create a helper hook or component (e.g., `<FeatureGate tier="ENTERPRISE">`) to conditionally render content.
- Update `Sidebar.tsx`, `CategoryBoard.tsx`, and Modals to use this check.

## Acceptance Criteria
- Free users cannot see/click Team or Phase features.
- Attempting to access these features via API (if UI is bypassed) should still return 403 (already implemented in backend).
