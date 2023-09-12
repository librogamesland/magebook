import { bookify, type Book } from "../book-utils"

const mimetype = 'text/json'
const extension = 'json'

const decode = (file : string) : string=> {
  const { text, index, content} = JSON.parse(file)
  return text
}


const encode = (bookOrText : Book | string) => {
  const {text, index, content } = bookify(bookOrText)

  return {
    encodedBook: JSON.stringify({text, index, content}, null, 2),
    mimetype,
    extension
  }
}



export default {mimetype, extension, decode, encode }