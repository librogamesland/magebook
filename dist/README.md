# Magebook API
API of the [Magebook editor](https://magebook.github.com/).
<img src="https://librogamesland.github.io/magebook/docs/screenshots/1.jpg" alt="magebook screenshot" style="max-width:100%;">


Magebook provides a command line tool and a javascript ([Node.js](https://nodejs.org/)) api to work with Magebook md format. You can use it to convert book formats, analyze books, or bundle your book inside a web app with [Rollup](https://rollupjs.org/) or [Vite](https://vitejs.dev/).


## Usage

To use the cli tool, install [bun](https://bun.sh/) and run:
```bash
bunx magebook --help
```

Otherwise, install the api as a Node module using `npm install magebook`



## Book indexes
The core feature of this api is an indexing function that generates a js object from a text, with every info about chapters, links and so on.

Book indexes have the following structure:
```javascript
const book = {
  text: ... , // Here the full book text will be displayed
  index: {
    title: 'Book title',
    properties: {
      author: 'Luca Fabbian',
      revision: '1',
    },
    chapters: [
      {
        key: '1',
        title: '',
        group: 'groupname',
        flags: ['death'],
        lines: {
          start: 4,
          textStart: 5,
          textEnd: 8,
          end: 10,
        }
        links: ['1'], // keys of chapter a user could go from this one
        linkedFrom: [0], // index of chapters who are referring the key of this one
      }
    ],

    lineStarts: [ 0, 10, ...], // position of starting character of each line

    lines: {
      titlePageEnd: 3, // last line of the title page
      end: 10, // last line of the book
    }

    // default mapping for links
    keys: {
      '1': 0, // means that the chapter with index 0 is the default chapter with key 1
    },


    chaptersWith: {
      key: {
        '1': [0],
      }
      groups: {
        'groupname': [0],
      }
      flag: {
        'death': [0],
      }
    }
  },

  content: {
    titlePage,
    chapters: [
      {
        text: ... // full text of the chapter
        content: .... // just the content, purified by everything else
      }
    ]
  }
}

```

Thanks to book indexes, everything may be obtained in constant time without iterating the entire chapter array.

Some examples:
```javascript
// get all the link of chapter with key 1

book.index.chapters[book.index.keys['1']].links

```

#### Encode/decode formats
Magebook is able to create a markdown text from other formats and then convert this text into html, docx, fodt, etc.
```javascript
import {md, xlgc, fodt, docx, html, json } from 'magebook'


const test = `
# My Book
author: Luca Fabbian


### 1
Welcome`



// Or get the md file from another format
// const lgcBook = xlgc.decode(text)

// Write to fodt file
fs.writeFileSync('example.fodt', fodt.encode(data).encodedBook)


```


#### Rollup plugin

THIS FEATURE IS CURRENTLY UNDER REVISION
To import a `.md` file inside a javascript code, you need a bundler. Magebook includes a rollup plugin already configured for that. It will read the book and transpile it to a standard format book (like above).

You can set the `trasform` option to encode markdown to html on the fly.

Example:
```javascript
import { rollupMagebook, encodeChapter, textToHtml, htmlToText } from 'magebook';


// Set custom magebook parser
const magebookPlugin = rollupMagebook({
  transform: (key, chapter, book) => ({
    title: chapter.title,
    text: encodeChapter(chapter.text, {
      html:      text => textToHtml(text),
      paragraph: text => `${text}<br>`,
      strong:    text => `<b>${text}</b>`,
      em:        text => `<i>${text}</i>`,
      codespan:  text => htmlToText(text),
      code: (code)    => code,
      link: (href,i, text) => `<mage-link to="${href.replace('#', '')}">` +
          (text || book.chapters[href.replace('#', '')].title || href.replace('#', '')) +
        `</mage-link>`
    }),
  })
})


export default {
  // Put here your rollup config
  plugins: [
    magebookPlugin
  ]
}

```