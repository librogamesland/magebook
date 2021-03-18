const {formats} = require(__dirname + '/../../index.js')
const fs = require('fs')


const test = `
# Ciao
author: Luca Fabbian


### 1
Benvenuto nel libro!`



fs.writeFileSync('example.fodt', formats.fodt.encode(formats.md.decode(test)))