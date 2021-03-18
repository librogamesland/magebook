import { download } from '../file.js'
import docx   from './docx.js'
import fodt   from './fodt.js'
import json   from './json.js'
import md     from './md.js'

import vuejs  from 'rollup-plugin-lgcjs/js/vuejs.js'

const save = (name, extension, mimetype, data) => {
  download(name.replace('.xlgc', '') + '.' + extension, data)
}

export default {
  docx:  (name, data) => docx(name, data),
  fodt:  (name, data) => save(name, 'odt', 'application/vnd.oasis.opendocument.text', fodt(data)),
  md:    (name, data) => save(name, 'md', 'text/markdown', md(data)),
  json:  (name, data) => save(name, 'json', 'application/json', json(data)),
  vuejs: (name, data) => save(name, 'js',   'application/javascript', vuejs(data)),

}
