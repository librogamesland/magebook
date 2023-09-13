import {isNatNumber} from '../utils.js'

import { js2xml, xml2js } from '../xml-js/index.mjs'
import {trimHTML, encodeToHTML, raw, mangle} from '../encoder.js'
import {bookify, type Book, chaptersOf, type ChapterData, chapterText} from '../book-utils'


const mimetype = 'application/xml'
const extension = 'xlgc'


const lgcVersion = "3.4.3.447"

const whitelist = ['<b>', '</b>', '<i>', '</i>', '<u>', '</u>']


const sanitizeHTML = (text: string) => {
  const t = document.createElement("p")
  t.innerHTML = text
  return t.innerHTML

}



/* ENCODING */
const renderer = {
  html:      (text : string) => whitelist.includes(text.trim().toLowerCase()) ? text.trim().toLowerCase() : mangle(text),
  paragraph: (text : string) => `<p>${text}</p>`,
  strong:    (text : string) => `<b>${text}</b>`,
  em:        (text : string) => `<i>${text}</i>`,
  codespan:  (text : string) => '`' + text + '`',
  code: (code : string, lang : string) => '<p>```' + lang + mangle(code).replace(/\n/g, '</p><p>') + '```</p>',
  link: (href : string,i : string, text : string) => `{link ${href.replace('#', '')}:${text || '@T'}}`,
  br: () => '</p><p>'
}


const arrayfy = <T>(obj : T | T[]) : T[] => (Array.isArray(obj)) ? obj : [obj]

type LGCHashtag = { _attributes: { color: string, count: string, label: string }}
type LGCValue = { _cdata?: any; _attributes: { name: string; type: string; }}
type LGCEntity = {
"_attributes": { group: string,    type: string, name?: string}
  attribute: LGCValue | LGCValue[]
}


type LGCSchema = {
  _declaration: { _attributes: { version: string,  encoding: string, } }
  book : {
    _attributes: { producer: string, producer_version: string,  schema_version: string,},
    entities: { entity: LGCEntity | LGCEntity[], },
    hashtags: { hashtag: LGCHashtag | LGCHashtag[],}
  }
}

const parseContent = (content : string) : string => {
  let r = content.replaceAll('\n', '').replaceAll('<br>', '\n').replaceAll('<br/>', '\n')
            .replaceAll('</p>', '\n').replaceAll('<p>', '').split('\n')
            .map(s => s + (s.includes('<p ') ? '</p>':'')).join('\n')

  return r
}


const decode = (text: string) : string => {
  let r = ""
  const xlgc = xml2js(text, {compact: true}) as LGCSchema

  let title = ""
  const properties : Record<string, string> = {}
  const chapters : ChapterData[] = []


  for (const entity of arrayfy(xlgc.book.entities.entity)) {
    if(entity._attributes.group === "setup") {
      if(entity._attributes.type === "game"){
        for(const attr of arrayfy(entity.attribute)){
          let value = attr._cdata
          if(!(typeof value === "string") || value.trim().length === 0) continue
          const name = (attr._attributes.name as string).trim()
          value = value.trim()

          if(name === 'title') title = value
          if(['author', 'version', 'lgc_version', 'revision'].includes(name)){
            properties.name = value
          }
        }
      }else if(entity._attributes.type === "global_attributes") {
        for(const attr of arrayfy(entity.attribute)){
          let value = attr._cdata
          if(!(typeof value === "string") || value.trim().length === 0) continue
          const name = (attr._attributes.name as string).trim()
          value = value.trim()
          if(['description','chapter_title'].includes(name)) continue
          properties[`@${name}`] = value
        }
      }

    }else {

/*     "_attributes": {
        "group": chapter.group,
        "type": isNatNumber(chapter.key) ? "chapter" : "section",
        "name": chapter.key
      },
      "attribute": [
        ["description", "string", encodeToHTML(content, renderer).trim() ]
        // @ts-ignore
        ["chapter_title", "string", chapter.title],
        ["hashtags", "array", filterFlags(chapter.flags)],
        ["flag_export", "boolean", !chapter.flags.includes("noexport")],
        ["flag_fixed", "boolean", chapter.flags.includes("fixed")],`*/


      const attrs : Record<string, string>= {}
      for(const attr of arrayfy(entity.attribute)){
        let value = attr._cdata
        if(!(typeof value === "string") || value.trim().length === 0) continue
        const name = (attr._attributes.name as string).trim()
        attrs[name] = value
      }

      chapters.push({
        key: entity._attributes.name as string,
        title: attrs['chapter_title'] ?? '',
        flags: [],
        group: entity._attributes.group ?? '',
        content: parseContent(attrs['description']?? ''),
      })
    }
  }

  if(title !== "") r+= `# ${title}` + '\n'
  Object.entries(properties).forEach(([key, value]) => { r+= `${key}: ${value}` + '\n' })
  if(r.length > 0) r += '\n'
  r += chapters.map(chapter => chapterText(chapter)).join('\n')

  return r
}


const filterFlags = (flags: string[]) : string => {
  const result : string[] = []
  return result.join(';')
}

// Codifica il libro
const encode = (bookOrText : Book | string) => {
  const book = bookify(bookOrText)

  const schema : LGCSchema = {
    "_declaration": {
      "_attributes": { "version": "1.0", "encoding": "UTF-8" }
    },
    "book": {
      "_attributes": { "producer": "LGC", "producer_version": lgcVersion, "schema_version": "1.0" },
      "entities": { "entity": [], },
      "hashtags": { "hashtag": [], }
    }
  }

  const hashtag =  {
    "_attributes": {
      "color": "#000000",
      "count": "1",
      "label": "badending"
    }
  }

  const xmlValue = (name: string | boolean, type: string, cdata: any) => ({
    "_attributes": { name, type },
    ...(type === "boolean"
      ? { "_cdata": (cdata == true) ? "true" : "false" }
      : cdata === null
        ? {}
        : {"_cdata":cdata}),
  })

  for(const [chapter, {content} ] of chaptersOf(book)){

    (schema.book.entities.entity as LGCEntity[]).push({
      "_attributes": {
        "group": chapter.group,
        "type": isNatNumber(chapter.key) ? "chapter" : "section",
        "name": chapter.key
      },
      "attribute": [
        ["description", "string", encodeToHTML(content, renderer).trim() ],
        ["chapter_title", "string", chapter.title],
        ["hashtags", "array", filterFlags(chapter.flags)],
        ["flag_export", "boolean", !chapter.flags.includes("noexport")],
        ["flag_fixed", "boolean", chapter.flags.includes("fixed")],
      ].map(([name, type, cdata]) => xmlValue(name, type, cdata)),
    })
  }

  (schema.book.entities.entity as LGCEntity[]).push({
    "_attributes": { "group": "setup", "name": "game", "type": "entity" },
    "attribute": [
      ["description", "string", "<p></p>" ],
      ["chapter_title", "string", null],
      ["hashtags", "array", null],
      ["lgc_version", "string", lgcVersion],
      ["title", "string", book.index.title.trim()],
      ["author", "string", book.index.properties['author'] ?? ''],
      ["version", "string", book.index.properties['version'] ?? ''],
      ["revision", "integer", "1"],
      ["editing_action", "string", "WRITING"],
      ["table_of_contents", "string", "P(ALL)"],
      ["editing_chapter", "string", book.index.chapters[0].key],
      // @ts-ignore
    ].map(([name, type, cdata]) => xmlValue(name, type, cdata)),
  },{
    "_attributes": { "group": "setup", "name": "global_attributes", "type": "entity" },
    "attribute": [
      ["description", "string", "<p></p>" ],
      ["chapter_title", "string", null],
      // ["protagonista", "string", "Autolico"] TODO: aggiungere le sostituzioni automatiche
      // @ts-ignore
    ].map(([name, type, cdata]) => xmlValue(name, type, cdata)),
  })



  return {encodedBook: js2xml(schema, {compact: true, spaces: 2}), mimetype, extension }
}


export { encode, decode, mimetype, extension }