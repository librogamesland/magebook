
const test = {
  key: "1",
  properties: {
    title: "My book",
    author: "Luca Fabbian",
    revision: "1",
  },
  chapters: {
    "intro": { title: "Introduzione", group: "", text: "", flags: [] },
    "rules": { title: "Regolamento", group: "",  text: "", flags: [] },    
    "1": {
      title: "Titolo",
      group: "",
      text: "Nel nuovo formato, si usa il doppio asterisco **per fare il grassetto**, mentre `così si fa il codice`." +
            "\nI link si fanno con [Titolo](#numero), se il titolo viene omesso verrà preso quello del paragrafo, ad esempio [](#2).",
      flags: []
    },
    "2": {
      title: "",
      group: "",
      text: "Nel menu laterale dovrebbe apparire che il paragrafo laterale ha un link verso questo paragrafo.",
      flags: ["final", "death"]
    },
  }
}

export { test }