#!/usr/bin/env bun
'use strict';
import fs from 'fs'
import packageJson from './package.json'  assert { type: "json" };
import { getTextOfRemoteBook,
  md, xlgc, docx, json, fodt, html } from './index.js'

const helpMsg = `=== Magebook converter v.${packageJson.version}===

Usage:
  magebook-converter <input> <output>

Options:
  -h, --help     output usage information
  -V, --version  output the version number

Supported inputs/outputs:
  urls: any url including a #fsession= parameter
  files: any file name
  --: stdin/stdout. Specify an extension after to force format.


Examples:
  magebook book.md book.docx      # Convert book.md to book.docx
  magebook book.md --.json        # Convert book.md to json and print to stdout

`

for (let j = 2; j < process.argv.length; j++) {
  if(process.argv[j] === '-h' || process.argv[j] === '--help'){
    console.log(helpMsg);
    process.exit(0);
  }
  if(process.argv[j] === '-V' || process.argv[j] === '--version'){
      console.log(packageJson.version);
      process.exit(0);
    }
}

const fatal = (message) => {
  console.error(message);
  process.exit(1);
};

if(process.argv.length < 4) fatal('Error: specify at least 2 arguments');



const inputExtensions = {
  'magebook': md,
  'md': md,
  'xlgc': xlgc,
}

const outputExtensions = {
  'magebook': md,
  'md': md,
  'xlgc': xlgc,
  'html': html,
  'docx': docx,
  'json': json,
  'fodt': fodt,
}

const readStdin = () => new Promise((resolve, reject) => {
  process.stdin.setEncoding('utf8');
  let input = '';
  process.stdin.on('data', (chunk) => {input += chunk; });
  process.stdin.on('end', () => { resolve(input); });
  process.stdin.on('error', (err) => { reject(err); });
})

const magebookOrExtension = (input) => {
  const lastIndex = input.lastIndexOf('.');
  if(lastIndex === -1) return 'magebook';
  return input.substring(lastIndex + 1);
}

const getInput = () => {
  const input = process.argv[2];
  if(input.startsWith('--'))       return [magebookOrExtension(input), () => readStdin()]
  if(input.includes('#fsession=')) return ['magebook', () => getTextOfRemoteBook(input)]

  const lastIndex = input.lastIndexOf('.');
  if(lastIndex === -1) fatal(`Error: input file "${input}" has no extension`);
  return [input.substring(lastIndex + 1), () => fs.readFileSync(input, 'utf8')]
}

const getOutput = () => {
  const output = process.argv[3]
  if(output.startsWith('--'))       return [magebookOrExtension(output), (text) => process.stdout.write(text)]
  if(output.includes('#fsession=')) fatal(`Error: urls are unsupported as output format`);

  const lastIndex = output.lastIndexOf('.');
  if(lastIndex === -1) fatal(`Error:  output file "${output}" has no extension`);
  return [output.substring(lastIndex + 1), (text) => fs.writeFileSync(output, text)]


}


(async () => {
  const [inputExtension, readInput] = getInput();
  const [outputExtension, writeOutput] = getOutput();

  if(!(inputExtension  in inputExtensions )) fatal(`Error: unsupported input format: ${inputExtension}`);
  if(!(outputExtension in outputExtensions)) fatal(`Error: unsupported output format: ${outputExtension}`);

  const text = await Promise.resolve(readInput())
  if(inputExtension === outputExtension){
    writeOutput(text);
    return
  }

  const {encodedBook} = outputExtensions[outputExtension].encode(inputExtensions[inputExtension].decode(text))
  writeOutput(encodedBook)

})()