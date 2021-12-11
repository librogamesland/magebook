import docx from 'docx'
import saveAs from 'file-saver'
import {raw, mangle, encodeToHTML} from '../encoder.js'
import {isNumber} from '../utils.js'
import {Book} from '../book.js'

const textNodesUnder = (el) => {
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  while(n=walk.nextNode()) a.push(n);
  return a;
}

const renderer = (chapters) => ({
  html:      text => mangle(text),
  paragraph: text => `<p>${text}</p>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => '',
  code: (code, lang) => '',
  link: (key, i, text) => `<mage-link to="${key.replace('#', '')}">${
    text.trim() || chapters[key.replace('#', '')]?.title.trim() || key.replace('#', '')
  }</mage-link>`,
})

const addChapter = (key, chapters ) => {
  const title = chapters[key].title || key
  const text = chapters[key].text || " "
  const inlineStyle = false // isNumber(key)
  const breakAfter =  false //!isNumber(key)

  // Create Bookmark
  const bookMark = new docx.Bookmark(`mage${key}`, '')
  bookMark.text  = new docx.TextRun({
      text: inlineStyle ? `${title}. ` : title,
      bold: true,
      color: '#000000',
    })

  const l = document.createElement("div")
  l.innerHTML = encodeToHTML(text, renderer(chapters)) || '<p></p>'

  // Create paragraphs
  const paragraphs = []

  if(!inlineStyle){
    paragraphs.push(new docx.Paragraph({
        children: [bookMark],
        alignment: 'center',
        heading: docx.HeadingLevel.HEADING_3
    }))
  }

  const childNodes = l.childNodes
  childNodes.forEach( (p, i) =>{
    const children = []

    textNodesUnder(p).forEach( (node) => {
      let bold      = false
      let italics   = false
      let underline = false

      let domElement = node.parentNode
      while(domElement.tagName !== 'P'){
        const tag = domElement.tagName

        if(tag === 'MAGE-LINK'){
          const href= domElement.getAttribute('to')
          children.push(
            new docx.Hyperlink(node.nodeValue, `mage${href}`,`mage${href}`)
          )
          return
        }

        if(tag === 'B') bold      = true
        if(tag === 'I') italics   = true
        if(tag === 'U') underline = true
        domElement = domElement.parentNode
      }

      children.push(new docx.TextRun({
        bold, italics, underline,
        text: node.nodeValue
      }))
    })

    // Get alignment
    let alignment = 'both'
    // Create paragraph
    paragraphs.push(new docx.Paragraph({
        children: [
          ...((inlineStyle && i === 0) ? [bookMark] : []),
          ...children,
        ],
        alignment,
    }))
  })

  paragraphs.push(new docx.Paragraph({
      children: [
        new docx.TextRun(''),
        ...(breakAfter ? [new docx.PageBreak()] : []),
      ]
  }))

  return paragraphs
}


const encode = (book) => {
  if(!book["__is_book"]) book = new Book(book)
  const doc = new docx.Document({
    styles: {
    paragraphStyles: [
        {
            id: "Normal",
            name: "Normal",
            next: "Normal",
            quickFormat: false,
            run: {
                size: 24,
                font: "Times New Roman",
            },
            paragraph: {
                spacing: {
                    line: 276,
                },
            },
        },
      ],
    }
  });

  const children = []
  const {chapters, properties} = book.get()
  const name = properties.title || 'magebook'
  book.sortedKeys().forEach( key => {
    children.push(...addChapter(key, chapters))
  })

  doc.addSection({
      headers: { default: null, },
      size: {
        width: 8419,
        height: 11906,
      },
      margins: {
          top: 1417,
          right: 1134,
          bottom: 1134,
          left: 1134,
      },
      children,
  });

  docx.Packer.toBlob(doc).then(blob => {
    const reader = new FileReader();
    saveAs(blob, name + '.docx');
  });

  

}


export default {encode}