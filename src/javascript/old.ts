/*

export const indexBook = (bookText : string) => {
  const result = {
    properties: {},
    chapters: new Map(),
    linksToChapter: new Map(),
    groups: new Set(),
  }

  let key = ''
  let chapter

  let lastLineHadContent = false
  let lastContentLinePlusOne = 1

  const lines = bookText.split('\n')
  lines.forEach( (oLine, zeroIndexlineNumber) => {
    const i = zeroIndexlineNumber  // We keep zero indexed as reference
    const line = oLine.trim()

    if(lastLineHadContent) lastContentLinePlusOne = i
    lastLineHadContent = (line !== '')

    // Parsing dell'header
    if(key === '' && !line.startsWith('### ')) {
      if(line.startsWith('# ')) {
        result.properties['title'] = line.replace(/\#/g, '').trim()
        return
      }
      const semicolon = line.indexOf(':')
      if(semicolon !== -1){
        result.properties[line.substr(0, semicolon).trim()] = line.substr(semicolon + 1).trim()
      }
      return
    }

    // Parsing del testo
    if(line.startsWith('### ')){
      if(key !== ''){
        chapter.contentEnd = lastContentLinePlusOne - 1
        chapter.end = i - 1
        result.chapters.set(key, chapter)
      }
      // crea nuova entità
      key = line.substr(4).trim()
      let title = ''
      const index = key.indexOf('{#')
      if(index != -1){
        title = key.substr(0, index - 1).trim()
        key = key.substr(index + 2,  key.lastIndexOf('}') - 2 - index).trim()
      }
      chapter = {
        title,
        group: '',
        start: lastContentLinePlusOne,
        contentStart: i,
        contentEnd: i,
        end: i,
        flags: [],
        links: new Set(),
      }
      return
    }

    let flagStarts = [ '![flag-', '![][flag-' ]
    if(flagStarts.some( flagStart => line.includes(flagStart))){

      for(const flagStart of flagStarts){
        let i = 0;
        while((i = line.indexOf(flagStart, i)) != -1){
          i += flagStart.length
          const endBracket = line.indexOf(']', i)
          if(endBracket == -1) break
          const flag = line.substring(i, endBracket).trim()
          chapter.flags.push(flag)
        }
      }
      return
    }
    const groupIndex = line.indexOf('[group]:<> ("')
    if(groupIndex != -1){
      chapter.group = line.substring(groupIndex + 13, line.lastIndexOf('")'))
      result.groups.add(chapter.group)
      return
    }


    let myRegexp = new RegExp(`\\[([^\\[]*)\\]\\(\\s*\\#([^\\)]+)\\s*\\)`, "g");

    let match = myRegexp.exec(oLine);
    while (match != null) {
      const linkTarget = match[2].trim()
      chapter.links.add(linkTarget)
      if(!result.linksToChapter.has(linkTarget)) result.linksToChapter.set(linkTarget, new Set())
      result.linksToChapter.get(linkTarget).add(key)
      match = myRegexp.exec(oLine);
    }

    if(result.properties && result.properties['disableShortLinks'] === 'true') return

    let shortRegexp = new RegExp(`\\[([^\\[]*)\\](?!\\()`, "g");

    match = shortRegexp.exec(oLine);
    while (match != null) {
      const linkTarget = match[1].trim()
      chapter.links.add(linkTarget)
      if(!result.linksToChapter.has(linkTarget)) result.linksToChapter.set(linkTarget, new Set())
      result.linksToChapter.get(linkTarget).add(key)
      match = shortRegexp.exec(oLine);
    }

  })

  if(key !== ''){
    chapter.end = lines.length - 1
    chapter.contentEnd = lastLineHadContent ? chapter.end : lastContentLinePlusOne - 1
    result.chapters.set(key, chapter)
  }

  return result
}







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
    chapter.text =  raw(chapter.text.replace(/\<\/\p\>/g,'\n').replace(/\<\p\>/g,'').replaceAll('<br>', '\n')
      .replace(/\<i\>/g, '&lt;i&gt;').replace(/\<\/i\>/g, '&lt;/i&gt;')
      .replace(/\<b\>/g, '&lt;b&gt;').replace(/\<\/b\>/g, '&lt;/b&gt;')
      .replace(/\<u\>/g, '&lt;b&gt;').replace(/\<\/u\>/g, '&lt;/b&gt;')
      .replace(/{link (\w+):([^\}\{]+)}/g, (...all) => all[2].trim() == '@T' ? `[${all[1]}]` : `[${all[2]}](#${all[1]})` )
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






*/