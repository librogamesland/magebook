

interface Chapter {
  key : string,
  title : string,
  text: string,
  fullText: string,
  group: string,
  start: number,
  contentStart: number,
  contentEnd: number,
  end: number,
  flags: Set<string>,
  links: Set<string>,
} 

interface BookIndex {
  
}


export class Book {

  /** Create a new instance. 
  If a string is passed, create a new book from that string.
  If a Book is passed, return a shallow copy of that book. */
  constructor(book : string | Book ){
    if (!(typeof book === "string")) return book
    
    this.set(book)
  }


  #text: string
  #index : any

  set(text: string){
    this.#text = text
    
  }


  get text() : string                    { return this.#text; }
  get chapters(): Map<string, Chapter[]> { return this.#index.chapters }
  get linksTo(): Map<string, string>     { return this.#index.linksTo }

  // Allow checking 
  get __is_book(){ return true; }

}