
import death from '../assets/img/flags/death.png'
import fixed from '../assets/img/flags/fixed.png'
import final from '../assets/img/flags/final.png'
import genericFlag from '../assets/img/flags/generic.png'


export const flagsURLs = {death, final, fixed }

export const trimmedFlag = (flag) => flag.substring(0, flag.indexOf(':') !== -1 ? flag.indexOf(':') : Infinity )

export const flagURL = (flag, book) : string => {
  flag = trimmedFlag(flag)
  return flagsURLs[flag] ?? book.index.properties['flag-' + flag] ?? genericFlag
}

export const urlOfChapter = (chapter) => {
  return location.href + '&c=' + encodeURIComponent(chapter)
}