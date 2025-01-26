describe('Membership Purchase Flow', () => {
  before(() => {
    cy.login();
  });

  it('completes membership purchase flow', () => {
    cy.visit('/membership/plans');
    cy.get('[data-testid="plan-card"]').first().click();
    cy.get('[data-testid="checkout-button"]').click();
    cy.get('[data-testid="card-element"]').type('4242424242424242');
    cy.get('[data-testid="pay-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});