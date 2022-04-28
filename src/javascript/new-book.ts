import { writable, derived } from 'svelte/store';
import { debounced } from './debounced-store.js'
import { indexBook } from './book-utils.js'

const isLoaded = writable(false)


const book = debounced(100, '')



const $bookIndex = {}

const bookIndex = derived(
	book,
	$book => (Object.assign($bookIndex, indexBook($book)), $bookIndex)
);


export {isLoaded, book, bookIndex, $bookIndex}
