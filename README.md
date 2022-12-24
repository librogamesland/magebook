# Magebook web editor
A web editor for gamebook writing. Try NEW VERSION here: [https://librogamesland.github.io/magebook/editor](https://librogamesland.github.io/magebook/editor)


<img src="https://librogamesland.github.io/magebook/docs/screenshots/1.jpg" alt="magebook screenshot" style="max-width:100%;">

Old version here: [https://librogamesland.github.io/magebook/alpha](https://librogamesland.github.io/magebook/alpha)



## Developer api
Magebook provides a javascript ([Node.js](https://nodejs.org/)) api to work with Magebook md format. You can use it to convert book formats, analyze books, or bundle your book inside a web app with [Rollup](https://rollupjs.org/). [ciao] [cd]

Currently the api is under a major rework - do not expect it to work until version 1.1

---
Looking for an app template working out of the box? --> [https://github.com/librogamesland/magebook-template](https://github.com/librogamesland/magebook-template)

---
Otherwise, install the api as a Node module using `npm install magebook`



#### Standard format
Books data are encoded as plain JSON objects with the following structure:
```javascript
const data = {
  text: ... , // Here the full book text will be displayed
  title: 'Book title',
  properties: {
    author: 'Luca Fabbian',
    revision: '1',
  },

  keys: ['intro', '1'],

  chapters: {

    'intro': {
      key: 'intro',
      title: 'introduction',
      flags: ['final', 'fixed', 'death'],
      text: 'Go to chapter [](#1)',

      lines: {
        
      }
      linksTo: ['1'],
      linkedFrom: ['intro'],
    },

    '1': {
      title: '',
      flags: [],
      text: 'Go back to **[](#intro)**',
      linksTo:  ['intro'],
      linkedFrom: ['1'],
    },
  }
}

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