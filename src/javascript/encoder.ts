import {marked} from 'marked'

if(typeof DOMParser === 'undefined'){
  const JSDOM = global.JSDOM || require("jsdom").JSDOM;
  global.DOMParser = new JSDOM().window.DOMParser
  global.document = new JSDOM().window.document
}

const a = document.createElement('p')
const raw    = t => (a.innerHTML = t, a.textContent)
const mangle = t => (a.textContent = t, a.innerHTML)
export {raw, mangle}

window.marked = marked
const tokenizer = {
  heading(src){},
  nptable(src){},
  hr(src){},
  blockquote(src){},
  code(src){},
  def(src){},
  list(src){},
  table(src){},
  lheading(src){},

};

marked.use({ tokenizer });



const disableShortLinks = (disabled)  =>  {
  marked.use({
    tokenizer: {
      reflink(src){
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
  html:      text => mangle(text),
  paragraph: text => `${text}<br>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => raw(text),
  code:      text => '',
  reflink:   (...e)  => JSON.stringify(e) + "sdfvgbfvdcsa",
}

const encodeToHTML = (text, renderer = defaultHTMLRenderer, linkToGenerate = []) => {  
  marked.use({renderer: new marked.Renderer()})
  marked.use({ 
    renderer:{
      ...renderer,
      code: (text, ...all) => renderer.code(text.replace(/\n\n/g, '\n').replace('\n', ''), ...all)
    } 
  })
  return marked(text.replace(/\n/g, '\n\n'))
}


export {marked, encodeToHTML, disableShortLinks}