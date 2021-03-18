import docx from 'docx'
import saveAs from 'file-saver'

import {specialTags} from '../editor/formats.js'


const textNodesUnder = (el) => {
  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  while(n=walk.nextNode()) a.push(n);
  return a;
}


const addEntity = (book, entity, inlineStyle = false, breakAfter = false ) => {
  const entityTitle = book.entities[entity].title || entity
  const entityText  = book.entities[entity].data || '<p></p>'

  // Create Bookmark
  const bookMark = new docx.Bookmark(`mage${entity}`, '')
  bookMark.text  = new docx.TextRun({
      text: inlineStyle ? `${entityTitle}. ` : entityTitle,
      bold: true,
    })


  // Parse entity
  const l = document.createElement("div")
  let parsedText = entityText
      .replace(specialTags.todo, '')
      .replace(specialTags.lgcode, '')
      // Parse links
  ;(parsedText.match(/{link \w+:(\w|@)+}/g) || [])
    .forEach(match => {
      let [number, title] = match.split(':')
      number = stripHtml(number.substring(6))
      title = stripHtml(title.substring(0, title.length - 1).trim())
      if (title === '@T') title = book.entities[number].title || number
      parsedText = parsedText.replace(
        match,
        `<lgc-link to="${number}">${title}</lgc-link>`
      )
    })
  l.innerHTML = parsedText

  // Create paragraphs
  const paragraphs = []

  if(!inlineStyle){
    paragraphs.push(new docx.Paragraph({
        children: [bookMark],
        alignment: 'center',
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

        if(tag === 'LGC-LINK'){
          const href= domElement.getAttribute('to')
          children.push(
            new docx.Hyperlink(node.nodeValue, `lgcjs${href}`,`lgcjs${href}`)
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
    let alignment
    try { alignment =  p.getAttribute('align')
    }catch(e){}
    alignment =  alignment || 'left'
    if(alignment === 'justify') alignment = 'both'

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

export default (name, book) => {
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

  children.push(...addEntity(book, 'intro', false, false))
  children.push(...addEntity(book, 'rules', false, true))

  function isNaturalNumber(n) {
      n = n.toString(); // force the value incase it is not
      var n1 = Math.abs(n),
          n2 = parseInt(n, 10);
      return !isNaN(n1) && n2 === n1 && n1.toString() === n;
  }

  Object.keys(book.entities).filter( k => isNaturalNumber(k)).forEach( k => {
    children.push(...addEntity(book, k, true, false))
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

  return docx.Packer.toBlob(doc).then(blob => {
    const reader = new FileReader();

    reader.onload = () => {
        console.log("" + reader.result);
    };

    reader.readAsDataURL(blob);

      saveAs(blob, name.replace('.xlgc', '') + '.docx');
  });
}
