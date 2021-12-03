/*
*/
import { Book } from './book.js'
import { derived } from 'svelte/store'
import { test } from './tests/testbooks.js'

const book = new Book()


const chapter = derived( book, $book => ({
  key: $book.key, 
  value: {
    ...book.newChapter(),
    ...$book.chapters[$book.key]
  }
}))




export { book, chapter }