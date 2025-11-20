describe('MindKeep AI End-to-End', () => {
  let email: string;

  before(() => {
    // Generate unique email
    const uniqueId = Date.now();
    const emailCounter = (global as any).__testEmailCounter || 1;
    (global as any).__testEmailCounter = emailCounter + 1;
    email = `test${emailCounter}@example.com`;

    // Sign up
    cy.visit('/auth/signup');
    cy.contains('label', 'Full Name').next('input').type(`Test User ${uniqueId}`);
    cy.contains('label', 'Email').next('input').type(email);
    cy.contains('label', 'Password').next('input').type('password123');
    cy.get('button').contains(/sign up/i).click();
    cy.url().should('include', '/dashboard');

    // Upgrade user to ENTERPRISE
    cy.task('upgradeUserToEnterprise', email);

    // Reload to refresh session
    cy.reload();
  });

  after(() => {
    // Close is not needed in Cypress
  });

  it('Create a new category', () => {
    cy.get('button').contains(/new category/i).click();
    cy.get('input[placeholder="Category Name (e.g., Marketing Launch)"]').type('Test Category');
    cy.get('button').contains(/create category/i).click();
    cy.contains('Test Category').should('be.visible');
  });

  it('Create a todo in a category', () => {
    // Assumes 'Test Category' exists
    cy.contains('Test Category').parent().within(() => {
      cy.get('button').contains(/add a task/i).click();
    });

    cy.get('input[placeholder="Task title"]').type('Test Todo');
    cy.get('button').contains(/done/i).click();

    cy.contains('Test Todo').should('be.visible');
  });

  it('Create a team', () => {
    // Click the plus button next to "Teams" in sidebar
    cy.contains(/^Teams$/).parent().find('button').click();

    cy.get('input[placeholder="New Team Name"]').type('Test Team');
    cy.get('input[placeholder="New Team Name"]').next('button').click();

    cy.contains('Test Team').should('be.visible');

    // Close the modal
    cy.get('.fixed.inset-0').first().click(10, 10);
  });

  it('Assign category to team', () => {
    // Open Edit Category Modal
    cy.contains('Test Category').trigger('mouseover');
    cy.contains('Test Category').parent().find('button').filter(':has(svg.lucide-more-horizontal)').click();
    cy.contains('Edit Details').click();

    // Select Team
    cy.get('select').select('Test Team');
    cy.get('button').contains(/close & save/i).click();

    // Verify assignment
    cy.contains('TEST TEAM').should('be.visible');
  });
});