//import { getTextOfRemoteBook } from './src/api'
import { parseStringPromise } from 'xml2js'
import { compactBook, remapMoveChapters, sortBook} from './src/javascript/book-utils'

/*
getTextOfRemoteBook('https://librogamesland.github.io/magebook/editor/#fsession=eyJhcGlLZXkiOiJBSXphU3lEcFBsMUd3VGlGaWhmak1IQ09WbThKeVhhYXVfSXQ4cDAiLCJkYXRhYmFzZVVSTCI6Imh0dHBzOi8vbWFnb3NwYWNjYS1mYTg0Zi1kZWZhdWx0LXJ0ZGIuZXVyb3BlLXdlc3QxLmZpcmViYXNlZGF0YWJhc2UuYXBwLyIsImJvb2siOiJtYWdvc3BhY2NhIn0%3D')
  .then(console.log)

console.log('Hello, World!');*/



const bookText = `# Title

### Chapter 1 {#1}
Content of 1. This receives a link

### 3




### 7
![][flag-final]
Content of 7. Link to [1]


### 5
Content of 5. Link to the empty [2]
`

//console.log(remapMoveChapters(bookText, {0: 1, 1: 2, 2: 0}))
console.log(sortBook(bookText))