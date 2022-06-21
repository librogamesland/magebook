/// <reference types="cypress" />

const mageurl = 'http://localhost:4173'

describe('magebook editor', () => {
    beforeEach(() =>{
        cy.visit(mageurl)
    })

    it('has a navbar  with 4 h1 elements', () => {
        cy.get('nav > div > h1').should('have.length', 4)
    })
})