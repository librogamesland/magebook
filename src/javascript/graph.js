import md   from './formats/md.js'
import {Book}   from './book.js'


const hpccWasm = window["@hpcc-js/wasm"];


const sanitizeLabel = (text) => text.replace(/\//g, "\\").replace(/\"/g, '\"')

const generateGraph = (book) => {
  book = new Book(md.decode(book))
  const data = book.get()
  let s = `digraph{
    graph [fontname="arial", fontsize=10]; 
    node [fontname="arial", fontsize=12, style="rounded,filled", shape=box];
    edge [fontname="arial", fontsize=12];
`
  book.sortedKeys(data.chapters).forEach(key => {
    s += `${key} [label="${sanitizeLabel(book.fullTitle(key))}"]\n`
    book.linksTo(key).forEach(otherKey => {
      s += `${otherKey} -> ${key}\n`
    })
  });
  return s + '}'
}


// Return the src attribute of an img tag
const graphToImg = (book) => {
  console.log("generating graph..")
  return hpccWasm.graphviz.layout(generateGraph(book), "svg", "dot")
}

export {generateGraph, graphToImg}