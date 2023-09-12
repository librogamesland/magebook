import {marked} from 'marked'
import type { Book, BookChapter } from './book-utils';

export {marked}

if(typeof DOMParser === 'undefined'){
  const JSDOM = global.JSDOM || require("jsdom").JSDOM;
  global.DOMParser = new JSDOM().window.DOMParser
  global.document = new JSDOM().window.document
}

const a = document.createElement('p')
const raw    = (t : string) => (a.innerHTML = t, a.textContent)
const mangle = (t : string) => (a.textContent = t, a.innerHTML)
export {raw, mangle}

window['marked'] = marked
const tokenizer = {
  heading(){},
  nptable(){},
  hr(){},
  blockquote(){},
  code(){},
  def(){},
  list(){},
  table(){},
  lheading(){},

};

// @ts-ignore
marked.use({ tokenizer });



export const disableShortLinks = (disabled : boolean)  =>  {
  marked.use({
    tokenizer: {
      reflink(src : string){
        if(disabled) return
        const rule = /^\[(.*?)\]/;  // Regex for the complete token, anchor to string start
        const match = rule.exec(src);
        if (match) {
          return {                                         // Token to generate
            type: 'link',                           // Should match "name" above
            raw: match[0],                                 // Text to consume from the source
            text: "",
            title: "",
            href: "#" + match[1].trim(),
            tokens: [],
          };
        }
      }
    }
  })
}

const defaultHTMLRenderer = {
  html:      (text: string) => mangle(text),
  paragraph: (text: string) => `${text.trim()}<br>`,
  strong:    (text: string) => `<b>${text}</b>`,
  em:        (text: string) => `<i>${text}</i>`,
  codespan:  (_text: string) => '',
  code:      (_text: string) => '',
  reflink:   (...e :any[])  => JSON.stringify(e),
  br:        (..._e : any[]) => '</p><p>',
}

export const encodeToHTML = (text : string, renderer : any = defaultHTMLRenderer ) : string => {
  return marked(text.replace(/\n/g, ' \\\n').replaceAll(' \\\n```', '\n\n```'), {
    renderer: Object.assign(
      new marked.Renderer(),
      renderer,
      {
        code: (text : string, infostring : string, ...all : any[]) => {
          //@ts-ignore
          return renderer.code(text.replaceAll(' \\\n', '\n'), infostring.replace(' \\', ''), ...all)
        }
      },
  )}) || ''
}


export const trimHTML = (htmlText : string) => {
  return htmlText
    .replaceAll(/( )*\<p\>( )*/g, '<p>')
    .replaceAll(/( )*\<\/p\>( )*/g, '</p>')
    .replaceAll(/( )*\<br>( )*/g, '<br>')
}


export const sanitizeProperties = (p : Record<string, string> = {}) => {

  const properties = {
      disableShortLinks: false,
      page: {
        width:'14.8', height:'21',
        margins: ['2.5', '2', '2', '2'],
      },
      textFont: {
        family: 'Times New Roman',
        spacing: '100%',
        size: '12pt',
      },
      titleFont: {
        family: 'Times New Roman',
        spacing: '100%',
        size: '12pt',
      },
      titleStyle: 'default',
      //@ts-ignore
      renameTitle: (({book, chapter, key, title}) => '<b>' + (title == '' ? key : title) + '</b>') as Function,
      //@ts-ignore
      renameLink: (({book, chapter, text, key, title }) => text == '' ? (chapter == null ? 'ERROR' : (title == '' ? key : title)) : text) as Function,
      //@ts-ignore
      renameAnchor: (({book, key}) => key) as Function,

      advancedFormat: ['text/html', 'html'],
    }

  if(p['disableShortLinks'] && p['disableShortLinks'].trim().toLowerCase() == 'true'){
    properties.disableShortLinks = true
  }

  if(typeof p['page'] === 'string'){
    const page = p['page'].split(',')
    if(page[0]){
      //A3, A4, A5, A6, B4, B5, B6 or Letter.
      const pages : Record<string, string> = {
        A3: '29.70 42.00',
        A4: '21.00 29.70',
        A5: '14.80 21.00',
        A6: '10.50 14.80',
        B4: '25.00 35.30',
        B5: '17.60 25.00',
        B6: '12.50 17.60',
        Letter: '21.59 27.94',
      }
      const dimensions = (pages[page[0].trim()]
        ? pages[page[0].trim()]
        : page[0].trim()).split(/\s+/)


      if(dimensions.length >= 2){
        properties.page.width = dimensions[0]
        properties.page.height = dimensions[1]
      }
    }

    if(page[1]){
      const margins = page[1].trim().split(/\s+/)
      if(margins.length >= 4) properties.page.margins = margins
    }
  }

  if(p['textFont']){
    const textFont = p['textFont'].split(',')
    if(textFont[0]){
      properties.textFont.family = textFont[0].trim()
    }
    if(textFont[1]){
      let size = textFont[1].trim()
      if(!size.endsWith('pt')) size += 'pt'
      properties.textFont.size = size
    }
    if(textFont[2]){
      properties.textFont.spacing = textFont[2].trim()
    }
  }

  if(p['titleFont']){
    const titleFont = p['titleFont'].split(',')
    if(titleFont[0]){
      properties.titleFont.family = titleFont[0].trim()
    }
    if(titleFont[1]){
      let size = titleFont[1].trim()
      if(!size.endsWith('pt')) size += 'pt'
      properties.titleFont.size = size
    }
    if(titleFont[2]){
      properties.titleFont.spacing = titleFont[2].trim()
    }
  }

  if(p['titleStyle']){
    const styles = ['default', 'inline']
    const indexStyle = styles.indexOf(p['titleStyle'].trim().toLowerCase())
    if(indexStyle != -1) properties.titleStyle = styles[indexStyle]
  }

  if(p['renameTitle'])  properties.renameTitle  = new Function('{book, chapter, key, title}', 'return ' + p['renameTitle'].trim())
  if(p['renameLink'])   properties.renameLink   = new Function('{book, text, chapter, title, key }', 'return ' + p['renameLink'].trim())
  if(p['renameAnchor']) properties.renameAnchor = new Function('{book, key}', 'return ' + p['renameAnchor'].trim())


  if(p['advancedFormat']){
    const formatInfos = p['advancedFormat'].split(',')
    if(formatInfos[0]) properties.advancedFormat[0] = formatInfos[0].trim()
    if(formatInfos[1]) properties.advancedFormat[1] = formatInfos[1].trim()
  }

  return properties
}

export type ExportProperties = ReturnType<typeof sanitizeProperties>


export const renameKeyAndTitle = (properties : ExportProperties, book : Book, chapter : BookChapter) => {
  const renamedKey = properties.renameAnchor({ key: chapter.key, book, })
  const renamedTitle = properties.renameTitle({ book, chapter, key: chapter.key, title: chapter.title })

  return {renamedKey, renamedTitle}
}
