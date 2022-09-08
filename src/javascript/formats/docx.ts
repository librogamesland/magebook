import saveAs from 'file-saver'
import {trimHTML, mangle, encodeToHTML, sanitizeProperties} from '../encoder.js'
import {extractIndexedBook} from '../book-utils'

import docx, { UnderlineType } from 'docx'

const mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const extension = 'docx'


const textNodesUnder = (el) => {
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  while(n=walk.nextNode()) a.push(n);
  return a;
}


const whitelist = ['<b>', '</b>', '<i>', '</i>', '<u>', '</u>']

const inlineRenderer = () => ({
  html:      text => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: text => `${text}`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  () => '',
  code: () => '',
  link: () => '',
})

const renderer = (indexedBook, properties, currentChapter) => ({
  html:      text => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: text => `<p>${text}</p>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => '',
  code: (code, lang) => '',
  link: (fullKey, i, text) => {
    
    const key = fullKey.replace('#', '').trim()
    const renamedKey = properties.renameAnchor({
      key,
      book: indexedBook
    })
    const chapter = indexedBook.chapters.has(key) ? indexedBook.chapters.get(key) : null

    return `<mage-link to="${renamedKey}">${encodeToHTML(properties.renameLink({
      book: indexedBook,
      text: text.trim(), 
      chapter,
      title: chapter ? chapter.title : null,
      key,
      currentChapter,

    }), inlineRenderer())}</mage-link>`
  },
})


/* Strategy: 
convert markdown to html. Then process each text node of html.
For each text node, go up in the html tree. If a parent is '<b>', mark the
node as bold text (and so on)*/

const encode = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)
  const properties = sanitizeProperties(indexedBook.properties)
  const children = []
  
  const name = indexedBook.properties.title || 'magebook'
  for(let [key, chapter] of indexedBook.chapters){
    const inlineStyle = properties.titleStyle == 'inline' // isNumber(key)
    const breakAfter =  false //!isNumber(key)

    const {text} = chapter
    const renamedKey = properties.renameAnchor({
      key: key,
      book: indexedBook
    })

    const renamedTitle = properties.renameTitle({
      book: indexedBook,
      chapter,
      key: key,
      title: chapter.title ? chapter.title.trim() : '',

    })



    // GET HEADING 
    const t = document.createElement("p")
    t.innerHTML = encodeToHTML(renamedTitle, inlineRenderer()) || ''
    const tChildren = []
    textNodesUnder(t).forEach( (node) => {
      let bold      = false
      let italics   = false
      let underline = false

      let domElement = node.parentNode
      while(domElement.tagName !== 'P'){
        const tag = domElement.tagName


        if(tag === 'B') bold      = true
        if(tag === 'I') italics   = true
        if(tag === 'U') underline = true
        domElement = domElement.parentNode
      }

      tChildren.push(new docx.TextRun({
        bold, italics, underline,
        text: node.nodeValue
      }))
    })

  
    // Create Bookmark
    const bookMark = new docx.Bookmark({
      id: `${renamedKey}`,
      children: tChildren,
    })

  
    const l = document.createElement("div")
    l.innerHTML = trimHTML(encodeToHTML(text, renderer(indexedBook,properties, chapter)).replaceAll('<br>', '</p><p>') || '<p></p>')
  
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
              new docx.InternalHyperlink({
                children: [
                    new docx.TextRun({
                        bold, italics,
                        text: node.nodeValue,
                        style: "Hyperlink",
                        underline: underline ? null : {
                          type: null,
                          color: '#000000'
                        },
                    }),
                ],
                anchor: `${href}`,
              }))
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
            ...((inlineStyle && i === 0) ? [bookMark, new docx.TextRun({text: ' '})] : []),
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
  

    children.push(...paragraphs)
  }


  const doc = new docx.Document({
    styles: {
    paragraphStyles: [
        {
            id: "Normal",
            name: "Normal",
            next: "Normal",
            quickFormat: false,
            run: {
                size: Math.floor(Number(properties.textFont.size.replace('pt','')) * 2),
                font: properties.textFont.family,
            },
            paragraph: {
                spacing: {
                    line: Math.floor(
                      Number(properties.textFont.spacing.replace('%', '')) * 2.4),
                },
            },
        },  
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: Math.floor(Number(properties.titleFont.size.replace('pt','')) * 2),
            font: properties.titleFont.family,
            bold: false,
          },
          paragraph: {
              spacing: {
                line: Math.floor(
                  Number(properties.titleFont.spacing.replace('%', '')) * 2.4),
            },
          },
        },

      ],
    },
    sections: [{
      headers: { default: null, },
      properties: {
        page: {
          size: {
            width:  properties.page.width + 'cm',
            height: properties.page.height + 'cm',
          },
          margin: {
              top: properties.page.margins[0] + 'cm',
              right: properties.page.margins[1] + 'cm',
              bottom: properties.page.margins[2] + 'cm',
              left: properties.page.margins[3] + 'cm',
          },
        },
      },
      children,
    }],
  });

  docx.Packer.toBlob(doc).then(blob => {
    saveAs(blob, name + '.docx');
  });

  return {encodedBook: '', mimetype, extension }


}


export default {encode}