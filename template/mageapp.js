var MageApp = (function(){

  const { compile, h, watch, reactive } = Vue


  // Create a store that reads/write in localstorage
  const storeFromLocal = (key, defaultValue = '') => {
    const store = reactive(JSON.parse(localStorage[key] || JSON.stringify({
      defaultValue,
    })));
    watch(store, (newStore) => { localStorage[key] = JSON.stringify(newStore)}, {deep: true})
    return store
  }



  // Components
  const components = {}

  components['mageapp-main'] = {
    data: () => ({showSidemenu: false}),
    template: `
      <main :class="{mageapp: true, dark: $settings.dark}">
        <nav>
          <div class="content">
            <select @change="(e) => $store.history.push(e.target.value)">
              <option v-for="key in $magebook.toc" 
                :key="key" :value="key"
                :selected="($store.history.at(-1) || $magebook.toc[0]) === key"
              >{{$magebook.titles[key] || key}}</option>
            </select>
            <div class="zmdi zmdi-redo clickable" @click="$store.history.push($store.redoHistory.at(-1))" v-if="$store.redoHistory.length > 0"></div>
            <div class="zmdi zmdi-undo clickable" @click="$store.redoHistory.push($store.history.pop())" v-if="$store.history.length > 0"></div>
            <div class="zmdi zmdi-paste clickable" @click="showSidemenu = !showSidemenu"></div>
          </div>
        </nav>
        <Transition>
          <mageapp-book></mageapp-book>
        </Transition>
      </main>
      <aside :class="{visible: showSidemenu, mageapp: true, dark: $settings.dark}">
        <slot></slot>
      </aside>` 
  }

  const mageappBookTemplate = content => `
  <div :style="{
    'font-family': $settings.fontFamily,
    'font-size':   $settings.fontSize + 'pt',
    'line-height': $settings.lineHeight,
  }" class="mageapp-book" @click="(e) => {
    if(e.target.nodeName == 'A' && e.target.getAttribute('href').startsWith('#')){
      e.preventDefault()
      $store.history.push(e.target.getAttribute('href').substring(1))
      return false;
    }
  }"><div class="content">${content}</div></div>`

  components['mageapp-book'] = { 
    render: () => {
      try{
        return h(compile(mageappBookTemplate(this.$magebook.chapters[this.$store.history.at(-1) || this.$magebook.toc[0]])))
      }catch(e){console.log(e)}
      return h(compile(mageappBookTemplate('Error :(')))
    }
  }


  components['mageapp-list'] = {
    props: ['label', 'default', 'store'],
    data: () => ({selected: -1}),
    computed: {
      elements(){ 
        if(!this.$store[this.store] && this.default !== undefined){
          this.$store[this.store] = this.default
        }
        return this.$store[this.store] || []
      }
    },
    template: `
      <h2>
      {{label}} <slot></slot>
      <button @click="finaldialog.prompt().then( ans => {
          if(ans) {
            if(!$store[store]) $store[store] = []
            $store[store].push(ans)
          }
      })" class="zmdi zmdi-plus"></button>
      <button @click="finaldialog.prompt('<span class=\\'zmdi zmdi-edit\\'></span> ' + elements[selected],{value: elements[selected]}).then( ans => {
        if(ans) {
          elements[selected] = ans
        }
      })" :disabled="!($store[store] && $store[store][selected])" class="zmdi zmdi-edit"></button>
      <button @click="finaldialog.confirm('<span class=\\'zmdi zmdi-delete\\'></span> ' + elements[selected] +'?').then(ans => {
          if(ans) $store[store].splice(selected, 1);
      })" :disabled="!($store[store] && $store[store][selected])" class="zmdi zmdi-delete"></button>
      </h2>
      <div class="mageapp-list">
      <div v-for="(element,index) in elements" @click="selected = index" :class="{selected: index == selected}">{{element}}</div>
      </div>`
  }

  components['mageapp-notes'] = {
    props: ['label', 'default', 'store'],
    data: () => ({selected: -1}),
    computed: {
      value(){ 
        if(!this.$store[this.store] && this.default !== undefined){
          this.$store[this.store] = this.default
        }
        return this.$store[this.store] || ''
      }
    },
    template: `
      <h2>{{label}}<slot></slot></h2>
      <textarea :value="value" @input="(e) => {
        $store[this.store] = e.value || e.target.value
      }" class="mageapp-notes"></textarea>`
  }

  components['mageapp-fileloader'] = {
    props: ['label', 'extensions', 'onload', 'name'],
    data: () => ({selected: -1}),
    computed: {
      elements(){ 
        if(!this.$store[this.store] && this.default !== undefined){
          this.$store[this.store] = this.default
        }
        return this.$store[this.store] || []
      }
    },
    methods: {
      open(e){
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = async() => {
          await Promise.resolve(this.onload(reader.result))
          e.target.value = ''
        }
        reader.readAsText(file)
      },
    },
    template: `
    <input class="mageapp-fileloader" type="file" :id="name" :name="name" :accept="extensions.join(',')" @change="open" />
    <label class="mageapp-fileloader" :for="name">{{label}}<slot></slot></label>`
  }



  const fontCheck = new Set([
    // Others
    'EB Garamond', 'Garamond', 'Roboto', 'Noto', 'Droid Sans Mono', 'Droid Sans', 'Droid Serif',
    // Windows 10
    'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
    // macOS
    'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
  ]);

  const listFonts = () => {
    const fontAvailable = new Set(['Helvetica', 'Arial', 'serif', 'sans-serif']);
    for (const font of fontCheck.values()) {
      if (window.document.fonts.check(`12px "${font}"`)) {
        fontAvailable.add(font);
      }
    }
    return [...fontAvailable.values()].sort();
  }

  components['mageapp-settings'] = {
    data: () => ({
      fonts: listFonts(),
    }),
    template: `<div class="mageapp-settings">
      <select class="font" v-model="$settings.fontFamily">
        <option v-for="font in fonts" :value="font">{{font}}</option> 
      </select>
      <select class="size" v-model="$settings.fontSize">
        <option v-for="size in [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]" :value="size">{{size}}</option> 
      </select>
      <select class="height" v-model="$settings.lineHeight">
        <option v-for="size in ['100%', '115%', '135%', '150%', '175%', '200%']" :value="size">{{size}}</option> 
      </select>   
      <span class="zmdi zmdi-sun clickable" @click="$settings.dark = !$settings.dark"></span>   
    </div>`,
  }

  components['mageapp-storebuttons'] = {
    props: {
      setStore: {
        type: Function,
        default: (val) => window.localStorage['mageapp-store'] = JSON.stringify(val)
      },
      nameBackup: {
        type: Function,
        default: () => `backup-${this.$magebook.properties.title}-${(new Date()).toDateString()}.json`
      },
    },
    methods: {
      backup(){

        const element = document.createElement('a')
        element.setAttribute(
          'href',
          `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.$store, null, 2))}`
        )
        element.setAttribute('download', this.nameBackup())
      
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      
      },
    },
    template: `<div class="mageapp-storebuttons">
      <button @click="backup()">
        Backup <span class="zmdi zmdi-download"></span>
      </button>
      <mageapp-fileloader name="mageapp-load-file" :extensions="['.json']"
      :onload="(value) => {
        window.Promise.resolve(setStore(JSON.parse(value))).then(() => {
          window.location.reload()
        })
      }">Load <span class="zmdi zmdi-upload"></span>
      </mageapp-fileloader>      
      <button @click="finaldialog.confirm('Reset?').then(ans =>{
        if(ans){
          window.Promise.resolve(setStore({})).then(() => {
            window.location.reload()
          })
        }
      })">Reset <span class="zmdi zmdi-delete"></span>
      </button>
    </div>`,
  }





  // Vue plugin, use with app.use(MageApp.plugin, {options}) 
  const plugin = async(app, options = {}) => {

    window.$store = options.$store || storeFromLocal('mageapp-store', {}), 
    window.$settings = options.$settings || storeFromLocal('mageapp-settings', {}), 
    window.$magebook = window.$magebook || options.$magebook

    if(!window.$store.history) window.$store.history = []
    if(!window.$store.redoHistory) window.$store.redoHistory = []

    if(!window.$settings.fontFamily) window.$settings.fontFamily = 'Arial'
    if(!window.$settings.fontSize) window.$settings.fontSize = '14'
    if(!window.$settings.lineHeight) window.$settings.lineHeight = '135%'



    // Handle redo
    let lastLength = window.$store.history.length
    watch(window.$store.history, (newHistory) => {
      if(newHistory.length > lastLength){
        if(newHistory.at(-1) && newHistory.at(-1) === $store.redoHistory.at(-1)){
          $store.redoHistory.pop()
        } else {
          $store.redoHistory = []
        }
      }
      lastLength =  newHistory.length
    })

    // Register mageapp- components globally
    Object.entries(components).forEach( ([key, cmp]) => app.component(key, cmp))
    
    // Make window, $store, $settings, $magebook,... avaiable to components
    Object.assign(app.config.globalProperties, {
      $magebook: window.$magebook,
      $store: window.$store,
      $settings: window.$settings,
      window,
      finaldialog, 
      console, 
      location
    })
  }

  return { plugin, components, storeFromLocal}
})()


