/*
*/
import { Book } from './book.js'
import { derived } from 'svelte/store'
import { test } from './tests/testbooks.js'
import { db, Session } from './database.js'

const book = new Book()
const session = new Session(book, test)


const chapter = derived( book, $book => ({
  key: $book.key, 
  value: {
    ...book.newChapter(),
    ...$book.chapters[$book.key]
  }
}))

window.mage = {
  db, session, book
}


export { session, book, chapter }