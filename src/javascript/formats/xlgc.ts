import {isNatNumber} from '../utils.js'
import {encodeToHTML, raw, mangle} from '../encoder.js'
import {extractIndexedBook } from '../book-utils'

const isNumber = isNatNumber

const mimetype = 'application/xml'


const sortedKeys = (chapters) => Object.keys(chapters).sort( (a, b) => {
  const aIsNumber = isNumber(a)
  const bIsNumber = isNumber(b)

  if(!aIsNumber && bIsNumber) return -1
  if(aIsNumber && !bIsNumber) return +1
  if(!aIsNumber && !bIsNumber) return a.localeCompare(b)
  if(aIsNumber && bIsNumber) return  parseInt(a, 10) - parseInt(b, 10)
})


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
      .replace(/\<i\>/g, '&lt;i&gt;').replace(/\<\/i\>/g, '&lt;/i&gt;')
      .replace(/\<b\>/g, '&lt;b&gt;').replace(/\<\/b\>/g, '&lt;/b&gt;')
      .replace(/\<u\>/g, '&lt;b&gt;').replace(/\<\/u\>/g, '&lt;/b&gt;')
      .replace(/{link (\w+):([^\}\{]+)}/g, (...all) =>`[${all[2].trim() == '@T' ? '': all[2]}](#${all[1]})`  )
      .replace(/[\n\s]+$/, ""))
    chapters[id] = chapter
  })


    let s = `# ${properties.title}\n`
    Object.entries(properties).forEach(([key, value]) => {
      if(key !== 'title')  s+=`${key}: ${value.trim()}\n`
    })
    s+='\n\n\n'
  
    sortedKeys(chapters).forEach( key => {
      const chapter = chapters[key]
      s+= chapter.title ? `### ${chapter.title} {#${key}}\n` : `### ${key}\n`
      if(chapter.flags && chapter.flags.length){
        const flags = {
          'death': '![][flag-death]',
          'final': '![][flag-final]',
          'fixed': '![][flag-fixed]',
        }
        s+= chapter.flags.map( key => flags[key]).join(' ') + '\n'
      }
      if(chapter.group){
        s+=`[group]:<> ("${chapter.group}")\n`
      }
      s+= chapter.text.replace(/\n+$/, "") + '\n\n\n'
    })
  
  return s
    
}




const whitelist = ['<b>', '</b>', '<i>', '</i>', '<u>', '</u>']

/* ENCODING */
const renderer = {
  html:      text => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: text => `<p>${text}</p>`,
  strong:    text => `<b>${text}</b>`,
  em:        text => `<i>${text}</i>`,
  codespan:  text => '`' + text + '`',
  code: (code, lang) => '<p>```' + lang + mangle(code).replace(/\n/g, '</p><p>') + '```</p>',
  link: (href,i, text) => `{link ${href.replace('#', '')}:${text || '@T'}}`
}

const sanitizeHTML = (text: string) => {
  const t = document.createElement("p")
  t.innerHTML = text
  return t.innerHTML

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
  `<attribute name="description" type="string"><![CDATA[${sanitizeHTML(encodeToHTML(entity.text,renderer)) || '<p></p>'}]]></attribute>` +
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

  const indexedBook = extractIndexedBook(book)

  const { chapters, properties} = indexedBook
  let r =`<?xml version="1.0" encoding="UTF-8"?><entities>${
      encodeProperties(properties) +
      encodeMap(properties)}`

  for( const [key, chapter] of chapters){
    r += encodeEntity(key, chapter)
  }

  return r + `</entities>`
}


export default { decode, encode, mimetype }