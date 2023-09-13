import {trimHTML, mangle, encodeToHTML, sanitizeProperties, renameKeyAndTitle, type ExportProperties} from '../encoder.js'
import {bookify, type Book, chaptersOf} from '../book-utils'

import * as docx from '../../../node_modules/docx/build/index.js'

const mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const extension = 'docx'


const textNodesUnder = (el : Element) => {
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  while(n=walk.nextNode()) a.push(n);
  return a;
}


const whitelist = ['<b>', '</b>', '<i>', '</i>', '<u>', '</u>']

const inlineRenderer = () => ({
  html:      (text : string) => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: (text : string) => `${text}`,
  strong:    (text : string) => `<b>${text}</b>`,
  em:        (text : string) => `<i>${text}</i>`,
  codespan:  () => '',
  code: () => '',
  link: () => '',
})

const renderer = (book : Book, properties : ExportProperties) => ({
  html:      (text : string) => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: (text : string) => `<p>${text}</p>`,
  strong:    (text : string) => `<b>${text}</b>`,
  em:        (text : string) => `<i>${text}</i>`,
  br:        () => '</p><p>',
  codespan:  (_text : string) => '',
  code: (_code : string, _lang : string) => '',
  link: (fullKey : string, _i : string, text : string) => {

    const key = fullKey.replace('#', '').trim()
    const renamedKey = properties.renameAnchor({
      key,
      book,
    })

    const chapterIndex = book.index.keys[key]
    const chapter = (chapterIndex === undefined) ? undefined : book.index.chapters[chapterIndex]

    return `<mage-link to="${renamedKey}">${encodeToHTML(properties.renameLink({
      book,
      text: text.trim(),
      chapter,
      title: chapter?.title,
      key: chapter?.key,
    }), inlineRenderer())}</mage-link>`
  },
})


/* Strategy:
convert markdown to html. Then process each text node of html.
For each text node, go up in the html tree. If a parent is '<b>', mark the
node as bold text (and so on)*/

const encode = (bookOrText : Book | string) => {
  const book = bookify(bookOrText)
  const properties = sanitizeProperties(book.index.properties)
  const inlineStyle = properties.titleStyle == 'inline'
  const breakAfter =  false

  const children = []

  const name = book.index.title || 'magebook'
  for(const [chapter, {content}] of chaptersOf(book)){
    if(chapter.flags.includes('noexport')) continue
    const {renamedKey, renamedTitle} = renameKeyAndTitle(properties, book, chapter)



    // GET HEADING
    const t = document.createElement("p")
    t.innerHTML = encodeToHTML(renamedTitle, inlineRenderer()) || ''
    const tChildren : any[] = []
    textNodesUnder(t).forEach( (node) => {
      let bold      = false
      let italics   = false
      let underline = false

      let domElement = node.parentNode as Element
      while(domElement.tagName !== 'P'){
        const tag = domElement.tagName


        if(tag === 'B') bold      = true
        if(tag === 'I') italics   = true
        if(tag === 'U') underline = true
        domElement = domElement.parentNode as Element
      }

      tChildren.push(new docx.TextRun({
        bold, italics,
        underline: underline ? {
          color: '#000000',
        } : undefined,
        text: node.nodeValue ?? ''
      }))
    })


    // Create Bookmark
    const bookMark = new docx.Bookmark({
      id: `${renamedKey}`,
      children: tChildren,
    })


    const l = document.createElement("div")
    l.innerHTML = trimHTML(encodeToHTML(content, renderer(book,properties)).replaceAll('<br>', '</p><p>') || '<p></p>')

    // Create paragraphs
    const paragraphs = []

    if(!inlineStyle){
      paragraphs.push(new docx.Paragraph({
          children: [bookMark],
          alignment: docx.AlignmentType.CENTER,
          heading: docx.HeadingLevel.HEADING_3
      }))
    }

    const childNodes = l.childNodes
    childNodes.forEach( (p, i) =>{
      const children :any[] = []

      textNodesUnder(p as Element).forEach( (node) => {
        let bold      = false
        let italics   = false
        let underline = false

        let domElement = node.parentNode as Element
        while(domElement.tagName !== 'P'){
          const tag = domElement.tagName

          if(tag === 'MAGE-LINK'){
            const href= domElement.getAttribute('to')
            children.push(
              new docx.InternalHyperlink({
                children: [
                    new docx.TextRun({
                        bold, italics,
                        text: node.nodeValue ?? undefined,
                        style: "Hyperlink",
                        //@ts-ignore
                        underline: !underline ? {
                          type: null,
                          color: '#000000'
                        } : undefined,
                    }),
                ],
                anchor: `${href}`,
              }))
            return
          }

          if(tag === 'B') bold      = true
          if(tag === 'I') italics   = true
          if(tag === 'U') underline = true
          domElement = domElement.parentNode as Element
        }

        children.push(new docx.TextRun({
          bold, italics,
          underline: underline ? {
            color: '#000000'
          } : undefined,
          text: node.nodeValue ?? undefined
        }))
      })

      // Get alignment
      let alignment = docx.AlignmentType.BOTH
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
      headers: { default: undefined, },
      properties: {
        page: {
          size: {
            width:  `${parseFloat(properties.page.width)}cm`,
            height: `${parseFloat(properties.page.height)}cm`,
          },
          margin: {
              top:    `${parseFloat(properties.page.margins[0])}cm`,
              right:  `${parseFloat(properties.page.margins[1])}cm`,
              bottom: `${parseFloat(properties.page.margins[2])}cm`,
              left:   `${parseFloat(properties.page.margins[3])}cm`,
          },
        },
      },
      children,
    }],
  });

  return {encodedBook: '', mimetype, extension, blob: docx.Packer.toBlob(doc) }


}


export {encode, mimetype, extension}