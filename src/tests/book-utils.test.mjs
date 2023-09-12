import { afterAll, beforeAll, beforeEach, describe, expect, test, it } from 'vitest'
import dedent from 'dedent-js';

import { indexBook, contentBook, findNewKeyIndex, stringBook, addChapter } from '../javascript/book-utils';


describe('Book indexing', () => {
  it('should index a book with title and chapters', () => {
    const bookText = dedent`
      # Title
      ### Chapter 1
      This is chapter 1 content.
      ### Chapter 2
      This is chapter 2 content.
    `;

    const result = indexBook(bookText);

    expect(result.title).toBe('Title');
    expect(result.chapters.length).toBe(2);
    expect(result.chapters[0].key).toBe('Chapter 1');
    expect(result.chapters[0].title).toBe('');
    expect(result.chapters[1].key).toBe('Chapter 2');
    expect(result.chapters[1].title).toBe('');
  });

  it('should index a book with properties', () => {
    const bookText = dedent`
      Title: My Book
      Author: Luca Fabbian
      ### Chapter 1
      This is chapter 1 content.
    `;

    const result = indexBook(bookText);

    expect(result.properties.Title).toBe('My Book');
    expect(result.properties.Author).toBe('Luca Fabbian');
  });

  it('should handle short links and long links', () => {
    const bookText = dedent`
      ### Chapter 1
      This is [a link](#Chapter-2) and [another link].
      ### Chapter 2
      This is chapter 2 content.
    `;

    const result = indexBook(bookText);

    expect(result.chapters[0].links).toContain('Chapter-2');
    expect(result.chapters[0].links).toContain('another link');
  });

  it('should handle flags', () => {
    const bookText = dedent`
      ### Chapter 1
      ![][flag-one] ![flag-two]()
      This chapter has two flags: flag-one and flag-two.
    `;

    const result = indexBook(bookText);

    expect(result.chapters[0].flags).toContain('one');
    expect(result.chapters[0].flags).toContain('two');
  });

  it('should index a book without a title', () => {
    const bookText = dedent`
      ### Chapter 1
      This is chapter 1 content.
      ### Chapter 2
      This is chapter 2 content.
    `;

    const result = indexBook(bookText);

    expect(result.title).toBe('');
  });


  it('should handle empty input', () => {
    const bookText = '';
    const result = indexBook(bookText);
    expect(result.title).toBe('');
    expect(result.chapters.length).toBe(0);
  });

  it('should index a book with chapter titles', () => {
    const bookText = dedent`
      # Title
      ### Introduction {#1}
      This is the introduction.
      ### Main Content {#2}
      This is the main content.
    `;

    const result = indexBook(bookText);

    expect(result.title).toBe('Title');
    expect(result.chapters.length).toBe(2);
    expect(result.chapters[0].key).toBe('1');
    expect(result.chapters[0].title).toBe('Introduction');
    expect(result.chapters[1].key).toBe('2');
    expect(result.chapters[1].title).toBe('Main Content');
  });

  it('should handle duplicate chapter keys', () => {
    const bookText = dedent`
      ### Chapter 1
      This is chapter 1 content.
      ### Chapter 1
      This is another chapter with the same key.
    `;

    const result = indexBook(bookText);

    expect(result.chapters.length).toBe(2);
    expect(result.chapters[0].key).toBe('Chapter 1');
    expect(result.chapters[1].key).toBe('Chapter 1');
  });

  it('should index chapters with flags', () => {
    const bookText = dedent`
      ### Chapter 1
      ![][flag-one]
      This chapter has flag-one.
      ### Chapter 2
      ![][flag-two]
      This chapter has flag-two.
    `;

    const result = indexBook(bookText);

    expect(result.chapters[0].flags).toContain('one');
    expect(result.chapters[1].flags).toContain('two');
  });

  it('should index chapters with long links when short links are disabled', () => {
    const bookText = dedent`
      ### Chapter 1
      This is [a link].
      ### Chapter 2
      This is [another link].
    `;

    const result = indexBook(bookText);

    expect(result.chapters[0].links).toContain('a link');
    expect(result.chapters[1].links).toContain('another link');
  });

  it('should index chapters with groups', () => {
    const bookText = dedent`
      ### Chapter 1
      [group]:<> ("Group A")
      ### Chapter 2
      [group]:<> ("Group B")
    `;

    const result = indexBook(bookText);

    expect(result.chapters[0].group).toBe('Group A');
    expect(result.chapters[1].group).toBe('Group B');
  });

  it('should handle input with no chapters', () => {
    const bookText = dedent`
      Title: My Book
      Author: Luca Fabbian
    `;

    const result = indexBook(bookText);

    expect(result.properties.Title).toBe('My Book');
    expect(result.chapters.length).toBe(0);
  });

  it('should calculate lines properties correctly for chapters', () => {
    const bookText = `# Title

### Chapter 1
This is chapter 1 content.
### Chapter 2
This is chapter 2 content.
    `;

    const result = indexBook(bookText);

    expect(result.chapters[0].lines.start).toBe(1); // Line number where Chapter 1 starts
    expect(result.chapters[0].lines.end).toBe(3); // Line number where Chapter 1 ends
    expect(result.chapters[0].lines.textStart).toBe(2); // Line number where Chapter 1 text starts
    expect(result.chapters[0].lines.textEnd).toBe(3); // Line number where Chapter 1 text ends

    expect(result.chapters[1].lines.start).toBe(4); // Line number where Chapter 2 starts
    expect(result.chapters[1].lines.end).toBe(6); // Line number where Chapter 2 ends
    expect(result.chapters[1].lines.textStart).toBe(4); // Line number where Chapter 2 text starts
    expect(result.chapters[1].lines.textEnd).toBe(5); // Line number where Chapter 2 text ends
  });

  it('should calculate lines properties correctly for chapters with content', () => {
    const bookText = `### Chapter 1
This is chapter 1 content.
### Chapter 2
This is chapter 2 content.
Some more text in Chapter 2.`;

    const result = indexBook(bookText);

    expect(result.chapters[0].lines.start).toBe(0);
    expect(result.chapters[0].lines.end).toBe(1);
    expect(result.chapters[0].lines.textStart).toBe(0);
    expect(result.chapters[0].lines.textEnd).toBe(1);

    expect(result.chapters[1].lines.start).toBe(2);
    expect(result.chapters[1].lines.end).toBe(4);
    expect(result.chapters[1].lines.textStart).toBe(2);
    expect(result.chapters[1].lines.textEnd).toBe(4); // Line number where Chapter 2 text ends
  });

  it('should calculate lines properties correctly for chapters with empty lines', () => {
    const bookText = `
### Chapter 1

This is chapter 1 content.

### Chapter 2

This is chapter 2 content.
    `;

    const result = indexBook(bookText);

    expect(result.chapters[0].lines.start).toBe(0);
    expect(result.chapters[0].lines.end).toBe(4); // Line number where Chapter 1 text ends
    expect(result.chapters[0].lines.textStart).toBe(1); // Line number where Chapter 1 text starts
    expect(result.chapters[0].lines.textEnd).toBe(3); // Line number where Chapter 1 text ends

    expect(result.chapters[1].lines.start).toBe(4); // Line number where Chapter 2 starts
    expect(result.chapters[1].lines.end).toBe(8); // Line number where Chapter 2 ends
    expect(result.chapters[1].lines.textStart).toBe(5); // Line number where Chapter 2 text starts
    expect(result.chapters[1].lines.textEnd).toBe(7); // Line number where Chapter 2 text ends
  });

});


describe('Extracting book content ', () => {
  it('should extract a simple book with two chapter', () => {

    const bookText = dedent`
      ### Chapter 1
      ![][flag-one]
      This is chapter 1 content.

      ### Chapter 2
      This is chapter 2 content.
    `

    const result = contentBook(bookText);

    expect(result.chapters.length).toBe(2);
    expect(result.titlePage.trim()).toBe('')

    expect(result.chapters[0].content).toBe('This is chapter 1 content.')
    expect(result.chapters[1].content).toBe('This is chapter 2 content.')


  })


  it('should extract a simple book with just a title page ', () => {

    const bookText = dedent`
      # Title
      author: Luca Fabbian
      code-!todo: color: #fff;

    `

    const titlePage = bookText

    const result = contentBook(bookText);

    expect(result.chapters.length).toBe(0);
    expect(result.titlePage.trim()).toBe(titlePage.trim())
  })


  it('should extract a simple book with a title page and two chapters', () => {

    const bookText = dedent`
      # Title
      author: Luca Fabbian
      code-!todo: color: #fff;

      ### Chapter 1
      ![][flag-one]
      This is chapter 1 content.

      ### Chapter 2
      This is chapter 2 content.
    `

    const titlePage = dedent`
      # Title
      author: Luca Fabbian
      code-!todo: color: #fff;
    `

    const chapter1Text = dedent`
      ### Chapter 1
      ![][flag-one]
      This is chapter 1 content.
    `

    const result = contentBook(bookText);

    expect(result.chapters.length).toBe(2);
    expect(result.titlePage.trim()).toBe(titlePage.trim())

    expect(result.chapters[0].text.trim()).toBe(chapter1Text.trim())
    expect(result.chapters[0].content).toBe('This is chapter 1 content.')
    expect(result.chapters[1].content).toBe('This is chapter 2 content.')
  })
})




describe('Playing with keys ', () => {
  it('should find the place of some keys', () => {

    const bookText = dedent`
      # Title
      author: Luca Fabbian
      code-!todo: color: #fff;

      ### introduction
      Chapter content.

      ### 2
      Chapter content.


      ### 4
      Chapter content.

      ### 5
      Chapter content.


      ### 10000
      Chapter content.

      ### 10002
      Chapter content.
    `

    expect(findNewKeyIndex(bookText, '1' )).toBe(1)
    expect(findNewKeyIndex(bookText, '2' )).toBe(2)
    expect(findNewKeyIndex(bookText, '3' )).toBe(2)
    expect(findNewKeyIndex(bookText, '4' )).toBe(3)
    expect(findNewKeyIndex(bookText, '5' )).toBe(4)
    expect(findNewKeyIndex(bookText, '6' )).toBe(4)
    expect(findNewKeyIndex(bookText, '7' )).toBe(4)
    expect(findNewKeyIndex(bookText,  '9999' )).toBe(4)
    expect(findNewKeyIndex(bookText, '10000' )).toBe(5)
    expect(findNewKeyIndex(bookText, '10001' )).toBe(5)
    expect(findNewKeyIndex(bookText, '10002' )).toBe(6)
    expect(findNewKeyIndex(bookText, '10003' )).toBe(6)
    expect(findNewKeyIndex(bookText, '10004' )).toBe(6)
    expect(findNewKeyIndex(bookText, '100000000002' )).toBe(6)

    // Non-numeric keys should go to the end of the book
    expect(findNewKeyIndex(bookText, 'carruba' )).toBe(6)
    expect(findNewKeyIndex(bookText, 'ii' )).toBe(6)
    expect(findNewKeyIndex(bookText, '9.12' )).toBe(6)



  })


  it('should find the place of keys in empty book', () => {

    const bookText = dedent`
      # Title
      author: Luca Fabbian
      code-!todo: color: #fff;

      ### introduction
      Chapter content.

      ### 2
      Chapter content.


      ### 4
      Chapter content.

      ### 5
      Chapter content.


      ### 10000
      Chapter content.

      ### 10002
      Chapter content.
    `

    expect(findNewKeyIndex(bookText, '1' )).toBe(1)
    expect(findNewKeyIndex(bookText, '2' )).toBe(2)
    expect(findNewKeyIndex(bookText, '3' )).toBe(2)
    expect(findNewKeyIndex(bookText, '4' )).toBe(3)
    expect(findNewKeyIndex(bookText, '5' )).toBe(4)
    expect(findNewKeyIndex(bookText, '6' )).toBe(4)
    expect(findNewKeyIndex(bookText, '7' )).toBe(4)
    expect(findNewKeyIndex(bookText,  '9999' )).toBe(4)
    expect(findNewKeyIndex(bookText, '10000' )).toBe(5)
    expect(findNewKeyIndex(bookText, '10001' )).toBe(5)
    expect(findNewKeyIndex(bookText, '10002' )).toBe(6)
    expect(findNewKeyIndex(bookText, '10003' )).toBe(6)
    expect(findNewKeyIndex(bookText, '10004' )).toBe(6)
    expect(findNewKeyIndex(bookText, '100000000002' )).toBe(6)

    // Non-numeric keys should go to the end of the book
    expect(findNewKeyIndex(bookText, 'carruba' )).toBe(6)
    expect(findNewKeyIndex(bookText, 'ii' )).toBe(6)
    expect(findNewKeyIndex(bookText, '9.12' )).toBe(6)

  })


})


describe('action with chapters', () => {
  it('should add chapters to a book', () => {

    const book = stringBook(dedent`
      # Title

      ### 1
      Content of chapter 1


      ### 2
      Content of chapter 2
    `)

    addChapter(book, {
      key: '3',
      flags: [ 'final', 'death'],
      content: 'content of chapter 3'
    })

    console.log(book.text)

  })
})