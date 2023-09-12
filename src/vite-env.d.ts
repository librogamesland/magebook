/// <reference types="svelte" />
/// <reference types="vite/client" />


declare module 'date-format' {
  export default {
    asString( format: string, date: Date ): string
  }
}