import type { Book } from "../book-utils"

const mimetype = 'text/markdown'
const extension = 'magebook'

const decode = (file : string) => {
  return file
}


const encode = (bookOrText : Book | string) => {
  return {
    encodedBook: (typeof bookOrText === 'string') ? bookOrText : bookOrText.text,
    mimetype,
    extension
  }
}



export {mimetype, decode, encode, extension }