import {Book} from '../book.js'

const mimetype = 'text/markdown'

const decode = (file) => {
  let result = {
    properties: {},
    chapters: {},
  }

  let key = ''

  const sanitizeLastChapter = () => {
    result.chapters[key].text = result.chapters[key].text.replace(/[\n\s]+$/, "")
  }

  file.split('\n').forEach( (oLine, i) => { 
    const line = oLine.trim()
  
    // Parsing dell'header
    if(key === '' && !line.startsWith('### ')) {
      if(line.startsWith('# ')) {
        result.properties['title'] = line.replace(/\#/g, '').trim()
        return
      }
      const semicolon = line.indexOf(':')
      if(semicolon !== -1){
        result.properties[line.substr(0, semicolon)] = line.substr(semicolon + 1)
      }
      return
    }
  
    // Parsing del testo
    if(line.startsWith('### ')){
      // crea nuova entità
      if(key !== '') sanitizeLastChapter()
      key = line.substr(4).trim()
      let title = ''
      const index = key.indexOf('{#')
      if(index != -1){
        title = key.substr(0, index - 1).trim()
        key = key.substr(index + 2,  key.lastIndexOf('}') - 2 - index).trim()
      }
      result.chapters[key] = {
        title,
        text: '',
        group: '',
        flags: []
      }
      return
    }
  
    if(line.includes('![flag-')){
      ;['final', 'fixed', 'death'].forEach( (flag) => {
        if(line.includes(`![flag-${flag}]`)) result.chapters[key].flags.push(flag)
      })
      return
    }
    const groupIndex = line.indexOf('[group]:<> ("')
    if(groupIndex != -1){
      result.chapters[key].group = line.substr(groupIndex + 13, line.lastIndexOf('")') - groupIndex - 13)
      if(line.replaceAll(/\[group\]:<>[ ]*\([ ]*"[^"]*"[ ]*\)/g, '').trim() == '') return
    }
    result.chapters[key].text += oLine + '\n'
  })
  sanitizeLastChapter()

  result.key = String(result.properties['last_edited'] || Object.keys(result.chapters)[0]).trim()
  return result
}


const encode = (book) => {
  if(!book["__is_book"]) book = new Book(book)
  const {key : currentKey, chapters, properties} = book.get()
  let s = `# ${properties.title}\n`
  Object.entries({
    ...properties,
    'last_edited': currentKey,
  }).forEach(([key, value]) => {
    if(key !== 'title')  s+=`${key}: ${value}\n`
  })
  s+='\n\n\n'

  book.sortedKeys(chapters).forEach( key => {
    const chapter = chapters[key]
    s+= chapter.title ? `### ${chapter.title} {#${key}}\n` : `### ${key}\n`
    if(chapter.flags && chapter.flags.length){
      const flags = {
        'death': '![flag-death](https://librogamesland.github.io/lgcjs/release/static/flags/death.png)',
        'final': '![flag-final](https://librogamesland.github.io/lgcjs/release/static/flags/final.png)',
        'fixed': '![flag-fixed](https://librogamesland.github.io/lgcjs/release/static/flags/fixed.png)',
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



export default {mimetype, decode, encode}