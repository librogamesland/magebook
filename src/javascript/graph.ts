import { bookify, type Book } from './book-utils';
import { flagURL, urlOfChapterKey } from './urls';



// @ts-ignore
const Viz : any = window["Viz"];


const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\#$%&'()*+,-./:;<=>?@[\\]^_`{|}~àèéìòù\n ";

const whitelist = (text : string) => {
  let result = '';
  for (const char of text) {
    if (allowedChars.includes(char)) {
      result += char;
    }
  }
  return result;

}

const sanitizeLabel = (text : string) => text.replace(/\//g, "\\").replace(/\"/g, '\"')
const sanitizeLink = (text: string) => text.replace(/[\]\[\#\)\(]/g, "")


const nodeStyle  = (key : string, flags : string[], book: Book) => {
  if(flags.includes('final')) return ', color="#ffa200"'
  if(flags.includes('death')) return ', color="#000000", fontcolor="#FFFFFF"'
  if(flags.includes('fixed')) return ', color="#b02900", fontcolor="#FFFFFF"'
  if(flags.length > 0) {
    const relevantPart = /\w+/g.exec(flags[0])
    if(relevantPart !== null) {
      const seed = relevantPart[0].split("").reduce((acc, item) => acc + item.charCodeAt(0), 0)
      const color = seed % 8 + 1
      return `, color="${color}:1", fillcolor="#D3D3D3" style="rounded,filled,bold", colorscheme="accent8"`
    }
  }

  return ''
}

const generateGraph = (bookOrText : Book | string) => {
  const book = bookify(bookOrText)

  let s = `digraph{
    graph [fontname="arial", fontsize=10];
    node  [fontname="arial", fontsize=12, style="rounded,filled", shape=box];
    edge  [fontname="arial", fontsize=12];
  `

  const flagUrls : Record<string, URL> = {}
  for(const flag of Object.keys(book.index.chaptersWith.flag)){
    flagUrls[flag] = new URL(flagURL(flag, book), document.baseURI)
  }



  for(let [index, {key, title, links, flags }] of book.index.chapters.entries()){

    const {content} = book.content.chapters[index]
    key = whitelist(key)

    s += `
      chapter${index} [label=<<table border="0"><tr><td align="center">${whitelist(title ? `${key} - ${title}` : key)}</td></tr>${
          flags.length == 0 ? '' : `<tr><td align="center"><table border="0"><tr>${
              flags.map( flag => `<td align="center"><img src="${flagUrls[flag]}"/></td>`).join('')
          }</tr></table></td></tr>`
      }</table>>, tooltip="${whitelist(content)}"${nodeStyle(key, flags, book)}, href="${urlOfChapterKey(key)}"]`

    for(const link of links){
      if(book.index.keys[link]) s += `
        chapter${index} -> chapter${book.index.keys[link]}`

    }
  }



  let clusterNumber = 0
  for(let [group, chapterIndexes] of Object.entries(book.index.chaptersWith.group)){
    s+= `

    subgraph cluster${clusterNumber++}{
      graph [fontname="arial", fontsize=10];
      node  [fontname="arial", fontsize=12, style="rounded,filled", shape=box];
      edge  [fontname="arial", fontsize=12];
      style=filled
      fillcolor="#EEEEEE"
      color=black
      label = "${sanitizeLabel(group)}"
      labelfontsize=14
      labelfontname=arial

      ${chapterIndexes.map( index => `chapter${index}` ).join('; ')}
    }`
  }
  s +='\n}'
  console.log(s)
  return [s, {
    images: Array.from(new Set(Object.values(flagUrls))).map( url =>
      ({path:url, width: 30, height: 30})
    )
  }]
}


// Return the src attribute of an img tag
const graphToImg = async(bookOrText : Book | string) => {
  const viz = await Viz.instance()
  return viz.renderSVGElement(...generateGraph(bookOrText))
}

export {generateGraph, graphToImg}
