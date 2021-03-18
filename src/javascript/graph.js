const workerURL = 'static/graphviz/lite.render.js';
let viz = new Viz({ workerURL });

const sanitizeLabel = (text) => text.replace(/\//g, "\\").replace(/\"/g, '\"')

const generateGraph = (book) => {
  const data = book.get()
  let s = 'digraph{\n'
  book.sortedKeys(data.chapters).forEach(key => {
    s += `${key} [label="${sanitizeLabel(book.fullTitle(key))}"]\n`
    book.linksTo(key).forEach(otherKey => {
      s += `${otherKey} -> ${key}\n`
    })
  });
  return s + '}'
}


// Return the src attribute of an img tag
const graphToImg = async(book) => {
  const element = await viz.renderImageElement(generateGraph(book))
  return element.getAttribute('src');
}

export {generateGraph, graphToImg}