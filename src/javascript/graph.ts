import {extractIndexedBook}   from './book-utils'


const hpccWasm = window["@hpcc-js/wasm"];


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

  const indexedBook = extractIndexedBook(book)

  let s = `digraph{
    graph [fontname="arial", fontsize=10];
    node  [fontname="arial", fontsize=12, style="rounded,filled", shape=box];
    edge  [fontname="arial", fontsize=12];
  `

  const groups = Object.fromEntries([...indexedBook.groups].map(group => [group, []]))


  for(let [key, {title, group, links, flags, text}] of indexedBook.chapters){
    s += `
      "${key}" [label="${sanitizeLabel(title ? `${key} - ${title}` : key)}", tooltip="${text.replaceAll(/[^0-9a-z \`\<\>\.\'\[\]\(\)]/gi, '')}"${nodeStyle(key, flags, indexedBook)}]`

    for(const link of links){
      if(indexedBook.chapters.has(link)) s += `
        "${key}" -> "${sanitizeLink(link)}"`

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
  return s
}


// Return the src attribute of an img tag
const graphToImg = (book) => {
  return hpccWasm.graphviz.layout(generateGraph(book), "svg", "dot")
}

export {generateGraph, graphToImg}
