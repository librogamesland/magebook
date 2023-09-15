import * as navigator from '../../../javascript/navigator'
import * as graph from '../../../javascript/graph'
import * as bookUtils from '../../../javascript/book-utils'
import * as store from '../../../javascript/store'
import * as file from '../../../javascript/file'
import {writable, readable, get} from'svelte/store'
import { tick } from 'svelte'

import { dialog } from "../../../components/Dialogs.svelte";
import About from "./../../../components/dialogs/About.svelte";
import Confirm from "./../../../components/dialogs/Confirm.svelte";
import Graph from "./../../../components/dialogs/Graph.svelte";
import Remap from "./../../../components/dialogs/Remap.svelte";
import NewBook from "./../../../components/dialogs/NewBook.svelte";
import NewFirebook from "./../../../components/dialogs/NewFirebook.svelte";
import Recover from "./../../../components/dialogs/Recover.svelte";
import Settings from "./../../../components/dialogs/Settings.svelte";
import EditorButtons from "./../../../components/EditorButtons.svelte";


window['mageapi'] = {
  graph,
  bookUtils,
  store,
  file,
  svelte: {
    navigator,
    writable,
    readable,
    get,
    tick
  },
  dialogs: {
    dialog,
    About,
    Confirm,
    Graph,
    Remap,
    NewBook,
    NewFirebook,
    Recover,
    Settings,
    EditorButtons
  }
}


export const runEval = (code) => {
  return eval(code)
}