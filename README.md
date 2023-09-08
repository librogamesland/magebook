# Magebook web editor
A web editor for gamebook writing. Try last version here: [https://magebook.github.io](https://magebook.github.io)


<img src="https://librogamesland.github.io/magebook/docs/screenshots/1.jpg" alt="magebook screenshot" style="max-width:100%;">



## Usage guide

This file is intended for developer who wants to contribute to Magebook. If you are an user or a write, check the [official guide instead](https://librogamesland.github.io/magebook).



## Getting started

Make sure to have git and Node.js installed on your system.

First of all, clone the project from github:
```bash
git clone https://github.com/librogamesland/magebook.git
cd magebook  # move inside the directory
```


Setup dependencies.

Optional: keep in mind that we use google chrome to test components. You may skip chrome download and use your local chrome by exporting the following env vars:
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```
(replace `/usr/bin/google-chrome` with your local path, on linux you may find it with `whereis google-chrome`)

Finally, install dependencies with:

```
npm i
```


Now you may run:
```bash
npm run dev        # start magebook locally with live reload on save
npm run build      # prepare for deployment
npm run preview    # check if the built version works as expected


npm run docs       # start docs server
npm run test       # run tests (you need to export PUPPETEER_EXECUTABLE_PATH again)
```

### Deploy on firebase

As explained here: <https://medium.com/@prathampoddar01/deploying-a-vite-app-with-firebase-a-beginners-overview-c4064959353a>

```bash
npm install -g firebase-tools

firebase login
firebase init hosting

# And after npm run build
cd editor
firebase deploy

```

## Developer api
Magebook provides a javascript ([Node.js](https://nodejs.org/)) api to work with Magebook md format. You can use it to convert book formats, analyze books, or bundle your book inside a web app with [Rollup](https://rollupjs.org/).


---
Looking for an app template working out of the box? --> [https://github.com/librogamesland/magebook-template](https://github.com/librogamesland/magebook-template)

---
Otherwise, install the api as a Node module using `npm install magebook`



#### Standard format
Books data are encoded as plain JSON objects with the following structure:
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
        start: 4,
        textStart: 5,
        textEnd: 8,
        end: 10,
        linksTo: ['1'], // keys of chapter a user could go from this one
        linkedFrom: [0], // index of chapters who are referring the key of this one
      }
    ],


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

  contentIndex: {
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

Using the following structure, everything may be obtained in constant time without iterating the entire chapter array.

Some examples:
```javascript
// get all the link of chapter with key 1

book.index.chapters[book.index.keys['1']].links

```

#### Encode/decode formats
```javascript
const {formats} = require('magebook')
const fs = require('fs')


const test = `
# My Book
author: Luca Fabbian


### 1
Welcome`

// Check avaiable formats, current are: md, xlgc, fodt and docx
console.log(formats)

// Get file string as standard data format (as above)
const data = formats.md.decode(test)

// Write to fodt file
fs.writeFileSync('example.fodt', formats.fodt.encode(data))


```


#### Rollup plugin
To import a `.md` file inside a javascript code, you need a bundler. Magebook includes a rollup plugin already configured for that. It will read the book and transpile it to a standard format book (like above).

<right> dcdsfsdvf</right>

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