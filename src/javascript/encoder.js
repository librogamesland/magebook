import marked from 'marked'

if(typeof DOMParser === 'undefined'){
  const JSDOM = global.JSDOM || require("jsdom").JSDOM;
  global.DOMParser = new JSDOM().window.DOMParser
  global.document = new JSDOM().window.document
}

const a = document.createElement('p')
const raw    = t => (a.innerHTML = t, a.textContent)
const mangle = t => (a.textContent = t, a.innerHTML)
export {raw, mangle}


const tokenizer = {
  heading(src){},
  nptable(src){},
  hr(src){},
  blockquote(src){},
  code(src){},
  list(src){},
  def(src){},
  table(src){},
  lheading(src){},

};

marked.use({ tokenizer });


const defaultHTMLRenderer = {
  html:      text => mangle(text),
  paragraph: text => `${text}<br>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => raw(text),
  code:      text => '',
}

const encodeToHTML = (text, renderer = defaultHTMLRenderer) => {  
  marked.use({renderer: new marked.Renderer()})
  marked.use({ 
    renderer:{
      ...renderer,
      code: (text, ...all) => renderer.code(text.replace(/\n\n/g, '\n').replace('\n', ''), ...all)
    } 
  })
  return marked(text.replace(/\n/g, '\n\n'))
}

export {marked, encodeToHTML}