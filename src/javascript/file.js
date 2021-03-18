import { session } from './store.js'
import md   from './formats/md.js'
import xlgc from './formats/xlgc.js'
import fodt from './formats/fodt.js'
import docx from './formats/docx.js'



const formats = {
  'md': md,
  'xlgc': xlgc,
  'fodt': fodt,
  'docx': docx,
}


// Read file from fileinput
const open = (elem) => {
  // Crea una copia delle info del file
  const file = elem.files[0]
  const name = file.name

  // Usa un fileReader per leggere il file come testo
  const reader = new FileReader()
  reader.onload = () => {
    const extension = name.substr(name.lastIndexOf('.') + 1)
    if(!['md', 'xlgc'].includes(extension)){
      console.error("Unsupported format")
      return
    }

    session.open({
      file: {name: name.substr(0, name.lastIndexOf('.'))},
      data: formats[extension].decode(reader.result),
    })

    elem.value = ''
  }
  reader.readAsText(file)
}


// Download file
const download = async(formatKey, book) => {
  const format = formats[formatKey]
  var element = document.createElement('a')
  book.refresh(true)
  const encodedBook = await Promise.resolve(format.encode(book))
  console.log(encodedBook)
  if(!encodedBook) return
  element.setAttribute(
    'href',
    `data:${format.mimetype};charset=utf-8,${encodeURIComponent(encodedBook)}`
  )
  element.setAttribute('download', session.file.name + '.' + formatKey)

  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}


export { open, download }
