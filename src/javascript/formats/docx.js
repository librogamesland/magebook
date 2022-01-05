import docx from 'docx'
import saveAs from 'file-saver'
import {mangle, encodeToHTML} from '../encoder.js'
import {extractIndexedBook} from '../book-utils'

const textNodesUnder = (el) => {
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  while(n=walk.nextNode()) a.push(n);
  return a;
}


const whitelist = ['<b>', '</b>', '<i>', '</i>', '<u>', '</u>']

const renderer = (chapters) => ({
  html:      text => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: text => `<p>${text}</p>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => '',
  code: (code, lang) => '',
  link: (fullKey, i, text) => {
    const key = fullKey.replace('#', '')
    return `<mage-link to="${key}">${
      text.trim() || (chapters.has(key) ? (chapters.get(key).title.trim() || key) : key)
    }</mage-link>`
  },
})



const encode = (bookText) => {
  const indexedBook = extractIndexedBook(bookText)
  const children = []
  
  const name = indexedBook.properties.title || 'magebook'
  for(let [key, {title, text}] of indexedBook.chapters){
    title = title?.trim() || key 
    const inlineStyle = false // isNumber(key)
    const breakAfter =  false //!isNumber(key)
  
    // Create Bookmark
    const bookMark = new docx.Bookmark({
      id: `mage${key}`,
      children: [
        new docx.TextRun({
          text: inlineStyle ? `${title}. ` : title,
          bold: true,
          color: '#000000',
        })
      ]
    })
  
    const l = document.createElement("div")
    l.innerHTML = encodeToHTML(text, renderer(indexedBook.chapters)) || '<p></p>'
  
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
                        text: node.nodeValue,
                        style: "Hyperlink",
                    }),
                ],
                anchor: `mage${href}`,
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
                size: 24,
                font: "Times New Roman",
            },
            paragraph: {
                spacing: {
                    line: "276",
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
            width: "14.80cm",
            height: "21.00cm",
          },
          margin: {
              top: "2.5cm",
              right: "2cm",
              bottom: "2cm",
              left: "2cm",
          },
        },
      },
      children,
    }],
  });

  docx.Packer.toBlob(doc).then(blob => {
    saveAs(blob, name + '.docx');
  });

  

}


export default {encode}