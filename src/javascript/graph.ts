import {extractIndexedBook}   from './book-utils'
import { flagURL } from './urls';



const Viz = window["Viz"];


const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\#$%&'()*+,-./:;<=>?@[\\]^_`{|}~àèéìòù\n ";

const whitelist = (text) => {
  let result = '';
  for (const char of text) {
    if (allowedChars.includes(char)) {
      result += char;
    }
  }
  return result;

}

const sanitizeLabel = (text) => text.replace(/\//g, "\\").replace(/\"/g, '\"')
const sanitizeLink = (text) => text.replace(/[\]\[\#\)\(]/g, "")


const nodeStyle  = (key, flags, indexBook) => {
  if(flags.includes('final')) return ', color="#ffa200"'
  if(flags.includes('death')) return ', color="#000000", fontcolor="#FFFFFF"'
  if(flags.includes('fixed')) return ', color="#b02900", fontcolor="#FFFFFF"'
  if(flags.length > 0) {
    const relevantPart = /\w+/g.exec(flags[0])[0]
    const seed = relevantPart.split("").reduce((acc, item) => acc + item.charCodeAt(0), 0)
    const color = seed % 8 + 1
    return `, color="${color}:1", fillcolor="#D3D3D3" style="rounded,filled,bold", colorscheme="accent8"`
  }

  return ''
}

const generateGraph = (book) => {

  const indexedBook = extractIndexedBook(book.text)

  let s = `digraph{
    graph [fontname="arial", fontsize=10];
    node  [fontname="arial", fontsize=12, style="rounded,filled", shape=box];
    edge  [fontname="arial", fontsize=12];
  `

  const groups = Object.fromEntries([...indexedBook.groups].map(group => [group, []]))


  const flagRes = new Set()
  const addFlag = (flag) => {
    flagRes.add(flag)
    return flag
  }


  for(let [key, {title, group, links, flags, text}] of indexedBook.chapters){

    key = whitelist(key)

    s += `
      "${key}" [label=<<table border="0"><tr><td align="center">${whitelist(title ? `${key} - ${title}` : key)}</td></tr>${
          flags.length == 0 ? '' : `<tr><td align="center"><table border="0"><tr>${
              flags.map( flag => `<td align="center"><img src="${addFlag(new URL(flagURL(flag, book), document.baseURI))}"/></td>`).join('')
          }</tr></table></td></tr>`
      }</table>>, tooltip="${whitelist(text)}"${nodeStyle(key, flags, indexedBook)}, href="http://localhost:5173/#msession=WS8NEWal6qUixYhcOPZH&c=125"]`

    for(const link of links){
      if(indexedBook.chapters.has(link)) s += `
        "${key}" -> "${sanitizeLink(whitelist(link))}"`

    }
    if(group) groups[group].push(key)
  }



  let clusterNumber = 0
  for(let group of indexedBook.groups){
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

      ${groups[group].join('; ')}
    }`
  }
  s +='\n}'
  console.log(s)
  return [s, {
    images: Array.from(flagRes).map( url =>
      ({path:url, width: 30, height: 30})
    )
  }]
}


// Return the src attribute of an img tag
const graphToImg = async(book) => {
  const viz = await Viz.instance()
  return viz.renderSVGElement(...generateGraph(book))

  //return hpccWasm.graphviz.layout(generateGraph(book), "svg", "dot")
}

export {generateGraph, graphToImg}
