import md   from './formats/md.js'
import {indexBook}   from './book-utils'


const hpccWasm = window["@hpcc-js/wasm"];


const sanitizeLabel = (text) => text.replace(/\//g, "\\").replace(/\"/g, '\"')

const generateGraph = (book) => {

  const indexedBook = indexBook(book)
  console.log(indexedBook)

  let s = `digraph{
    graph [fontname="arial", fontsize=10]; 
    node  [fontname="arial", fontsize=12, style="rounded,filled", shape=box];
    edge  [fontname="arial", fontsize=12];
  `
  
  const groups = Object.fromEntries([...indexedBook.groups].map(group => [group, []]))


  for(let [key, {title, group, links}] of indexedBook.chapters){
    s += `
      ${key} [label="${sanitizeLabel(title ? `${key} - ${title}` : key)}"]`

    for(const link of links){
      s += `
        ${key} -> ${link}`
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
  console.log("generating graph..")
  return hpccWasm.graphviz.layout(generateGraph(book), "svg", "dot")
}

export {generateGraph, graphToImg}