import { writable, derived } from 'svelte/store';
import { debounced } from './debounced-store.js'
import { indexBook } from './book-utils.js'

const isLoaded = writable(false)


const book = debounced(100, '')

const bookIndex = derived(
	book,
	$book => indexBook($book),
);


export {isLoaded, book, bookIndex}
