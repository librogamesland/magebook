import marked from 'marked'

const renderer = {
  paragraph: (text) => `${text}<br>`,
  //code: () => '',
  //codespan: () => '',
}

const renderer2 = {
}


const encode = (book) => {
  const {chapters, properties} = book.get()
  const encoded = {properties, chapters: {}}
  marked.use({ renderer }); 
  // marked.use({renderer: new marked.Renderer(), } )
  marked.use({ renderer: renderer2 });
  book.sortedKeys(chapters).forEach(key => {
    encoded.chapters[key] = marked(chapters[key].text.replace(/\n/g, '\n\n'))
  });
  //console.log(encoded.chapters)
}

export {encode}