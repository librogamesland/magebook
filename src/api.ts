/* build with:
bun build firepad-api.ts --outfile index.js
*/


import { Headless } from '@lucafabbian/firepad'
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import { decode } from 'js-base64';
import queryString from 'query-string'


/**
 * Returns the first element of an array if 's' is an array with elements,
 * or 's' itself if it's a single value.
 */
//@ts-expect-error
const getLast = (s: string | string[]): string => (Array.isArray(s) && s.length > 0) ? s[s.length - 1] : s;

export const getTextOfRemoteBook = (url : string) => new Promise<string>((resolve, reject) => {

  const hash = url.substring(url.indexOf('#'))
  const fsession = getLast(queryString.parse(hash).fsession);
  const config = JSON.parse(decode(decodeURIComponent(fsession)))

  const app = firebase.initializeApp(config);

  // Get a reference to the database service
  const database = firebase.database(app);


  const headless = new Headless(database.ref(config.book))


  headless.getText( (text : string) => {
    resolve(text)
    headless.dispose()
    database.goOffline()
  })

})


export * from './javascript/book-utils'
export * as md from './javascript/formats/md'
export * as docx from './javascript/formats/docx'
export * as fodt from './javascript/formats/fodt'
export * as html from './javascript/formats/html'
export * as json from './javascript/formats/json'
export * as xlgc from './javascript/formats/xlgc'

