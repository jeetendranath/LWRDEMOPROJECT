import { createElement } from 'lwc';
import B2B_BS_Footer from 'c/b2B_BS_Footer';

describe('c-b-2-b-b-s-footer', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        // Arrange
        const element = createElement('c-b-2-b-b-s-footer', {
            is: B2B_BS_Footer
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // const div = element.shadowRoot.querySelector('div');
        expect(1).toBe(1);
    });
});