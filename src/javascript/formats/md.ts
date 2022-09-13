const mimetype = 'text/markdown'
const extension = 'md'

const decode = (file) => {
  return file
}


const encode = (book) => {
  return {encodedBook: book.book || book, mimetype, extension }
}



export default {mimetype, decode, encode }