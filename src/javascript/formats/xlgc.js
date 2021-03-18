import {isNumber} from '../utils.js'
import {encodeToHTML, raw, mangle} from '../encoder.js'
import {Book} from '../book.js'

const mimetype = 'application/xml'



const decode = xlgc => {
  const properties = {}, chapters = {}
  let key = ''

  const attributesWhitelist = [
    'lgc_version',
    'title',
    'author',
    'version',
    'revision',
    'table_of_contents',
    'editing_action',
    'editing_chapter',
  ]
  // Usa un DOMParser per interpretare il file xml
  const xmlDoc = new DOMParser().parseFromString(xlgc, 'text/xml')
  ;[...(xmlDoc.documentElement.children ||xmlDoc.documentElement.childNodes) ].forEach(entity => {
    const id = entity.getAttribute('name')
    const type = entity.getAttribute('type')
    const group = entity.getAttribute('group')

    // L'entità game è quella contenente i metadati come autore, revisioni, ...
    // Queste informazioni vengono memorizzate all'interno di info con la stessa chiave
    if (type === 'entity' && id === 'game') {
      ;[...entity.children].forEach(node => {
        const nodeName = node.getAttribute('name')
        const nodeValue = node.innerHTML.substring(9, node.innerHTML.length - 3)
        if(nodeName == 'editing_chapter') {
          key = nodeValue
        } else if (attributesWhitelist.includes(nodeName)){
          properties[nodeName] = nodeValue
        }
      })
      return // Termina qui, non aggiunge questa entità a section
    }

    if (type === 'entity' && id === 'map_data') {
      ;[...entity.children].forEach(node => {
        const nodeName = node.getAttribute('name')
        const nodeValue = node.innerHTML.substring(9, node.innerHTML.length - 3)
        if (nodeName === 'map_file') properties.map = nodeValue
      })
      return // Termina qui, non aggiunge questa entità a section
    }

    let chapter = {
      title: '',
      text: '',
      flags: []
    }
    if (group) chapter.group = group
      // Itera i nodi figli dell'entity alla ricerca di flag, titolo e contenuto
    ;[...entity.children].forEach(node => {
      const nodeName = node.getAttribute('name')
      const nodeValue = node.innerHTML.substring(9, node.innerHTML.length - 3)
      if (nodeName === 'chapter_title' && nodeValue) chapter.title = nodeValue
      if (nodeName === 'description') chapter.text = nodeValue
      if (nodeName === 'map_position') chapter.map = nodeValue
      if (nodeName.startsWith('flag_') && nodeValue === 'true') {
        chapter.flags.push(nodeName.substring(5)) // Aggiunge la flag
      }
    })
    // Inserisce nel jlgc l'oggetto section appena creato
    chapter.text =  raw(chapter.text.replace(/\<\/\p\>/g,'\n').replace(/\<\p\>/g,'')
      .replace(/\<b\>/g,'**').replace(/\<\/b\>/g,'**')
      .replace(/\<i\>/g,'*').replace(/\<\/i\>/g,'*')
      .replace(/{link (\w+):([^\}\{]+)}/g, (...all) =>`[${all[2].trim() == '@T' ? '': all[2]}](#${all[1]})`  )
      .replace(/[\n\s]+$/, ""))
    chapters[id] = chapter
  })

  return { properties, chapters, key }
}



/* ENCODING */
const renderer = {
  html:      text => mangle(text),
  paragraph: text => `<p>${text}</p>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => '`' + text + '`',
  code: (code, lang) => '<p>```' + lang + mangle(code).replace(/\n/g, '</p><p>') + '```</p>',
  link: (href,i, text) => `{link ${href.replace('#', '')}:${text || '@T'}}`
}

// Crea la sezione "game" con i metadati in info
const encodeProperties = (properties, key) =>
  `<entity group="setup" name="game" type="entity">` +
    `<attribute name="description" type="string"><![CDATA[<p></p>]]></attribute>` +
    `<attribute name="chapter_title" type="string"/>` +
    `<attribute name="lgc_version" type="string"><![CDATA[${properties.lgc_version || ''}]]></attribute>` +
    `<attribute name="title" type="string"><![CDATA[${properties.title     || ''}]]></attribute>` +
    `<attribute name="author" type="string"><![CDATA[${properties.author   || ''}]]></attribute>` +
    `<attribute name="version" type="string"><![CDATA[${properties.version || ''}]]></attribute>` +
    `<attribute name="revision" type="integer"><![CDATA[${properties.revision || '1'}]]></attribute>` +
    `<attribute name="editing_action" type="string"><![CDATA[${properties.editing_action ||  'WRITING'}]]></attribute>` +
    `<attribute name="table_of_contents" type="string"><![CDATA[${properties.table_of_contents || 'P(ALL)'}]]></attribute>` +
    `<attribute name="editing_chapter" type="string"><![CDATA[${key || '1'}]]></attribute>` +
  `</entity>`

const encodeMap = properties => !properties.map ? '' : 
  `<entity group="setup" name="map_data" type="entity">` +
    `<attribute name="description" type="string"><![CDATA[<p></p>]]></attribute>` +
    `<attribute name="chapter_title" type="string"/>` +
    `<attribute name="map_file" type="string"><![CDATA[${properties.map}]]></attribute>` +
  `</entity>`

// Crea una sezione/paragrafo
const encodeEntity = (key, entity) =>
  `<entity group="${entity.group || ''}" name="${key}" type="${isNumber(key) ? 'chapter' : 'section'}">` +
  `<attribute name="description" type="string"><![CDATA[${encodeToHTML(entity.text,renderer) || '<p></p>'}]]></attribute>` +
  `<attribute name="chapter_title" type="string"><![CDATA[${entity.title ||  ''}]]></attribute>` +
  `${ entity.type && entity.type !== 'chapter'  ? '' : 
    `<attribute name="flag_final" type="boolean"><![CDATA[${ entity.flags && entity.flags.includes('final') ? 'true' : 'false'}]]></attribute>` +
    `<attribute name="flag_fixed" type="boolean"><![CDATA[${ entity.flags && entity.flags.includes('fixed') ? 'true' : 'false'}]]></attribute>` +
    `<attribute name="flag_death" type="boolean"><![CDATA[${ entity.flags && entity.flags.includes('death') ? 'true' : 'false'}]]></attribute>`
  }` + (!entity.map ? '' : 
    `<attribute name="map_position" type="string"><![CDATA[${entity.map || ''}]]></attribute>`) +
  `</entity>`

// Codifica il libro
const encode = book => {
  if(!book["__is_book"]) book = new Book(book)
  const {key : currentKey, chapters, properties} = book.get()
  return `<?xml version="1.0" encoding="UTF-8"?><entities>${
      encodeProperties(properties, currentKey) +
      encodeMap(properties) +
      book.sortedKeys().reduce((acc, key) => acc + encodeEntity(key, chapters[key]), '')
    }</entities>`
}


export default { decode, encode, mimetype }