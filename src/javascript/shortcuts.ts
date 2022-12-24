
const shortcutsList = {

}

const ctrlShortcuts = (shortcuts) => Object.assign(shortcutsList, shortcuts)

const handleShortcuts = function(e) {
  if (e.ctrlKey){
    const key = String.fromCharCode(e.keyCode).toUpperCase()
    if(key in shortcutsList){
      shortcutsList[key]()
      e.stopPropagation()
      e.stopImmediatePropagation()
      e.preventDefault()
    }
  }
}

export {handleShortcuts, ctrlShortcuts, shortcutsList}
