const mimetype = 'text/markdown'

const decode = (file) => {
  let result = {
    properties: {},
    chapters: {},
  }

  let key = ''

  const sanitizeLastChapter = () => {
    try{
    result.chapters[key].text = result.chapters[key]?.text?.replace(/[\n\s]+$/, "") || ""
    }catch(e){}
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
  
    if(line.includes('![flag-') || line.includes('![][flag-')){
      ;['final', 'fixed', 'death'].forEach( (flag) => {
        if(line.includes(`![flag-${flag}]`) || line.includes(`![][flag-${flag}]`)) result.chapters[key].flags.push(flag)
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





export default {mimetype, decode }