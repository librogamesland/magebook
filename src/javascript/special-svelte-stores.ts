import { derived, get, writable, type Readable, type Writable } from 'svelte/store';

export const storable = (
  localStorageKey: string,
  defaultValues: Record<string, any>,
)  => {
  const r = {} as Record<string, Writable<any>>
  const der = [] as Array<Readable<[string, any]>>
  for (const [key, value] of Object.entries({
    ...defaultValues,
    ...JSON.parse(localStorage['mageai-settings'] || '{}'),
  })) {
    const store = writable(value);
    r[key] = store
    der.push(derived([store], ([$store]) => [key, $store] as [string,any]))
  }



  derived(der, (derValues) => {
    const storesValues : Record<string, any> = {}
    for (const [key, value] of derValues) {
      storesValues[key] = value
    }
    return JSON.stringify(storesValues)
  }).subscribe(value => localStorage[localStorageKey] = value)
  return r
}


export const mergeable = <T>() => {
  const substores : Writable<Record<string, T>>[] = []
  const { subscribe, set } = writable({} as Record<string, T>);

  const rebuild = () => {
    const obj : Record<string, T> = {}
    for(const store of substores) {
      Object.assign(obj, get(store))
    }
    set(obj)
  }

  const extend = (initialValue : Record<string, T> = {}) => {
    const w = writable(initialValue);
    substores.push(w)
    rebuild()
    w.subscribe( () => rebuild())
    return w
  }

  return {
    subscribe,
    extend
  }
}

export const arrayable = <T>() => {
  const substores : Writable<T | T[]>[] = []
  const { subscribe, set } = writable([] as T[]);

  const rebuild = () => {
    let obj : T[] = []
    for(const store of substores) {
      const objValue : T[] | T = get(store)

      if(Array.isArray(objValue)) {
        obj = [...obj,...objValue]
      } else {
        obj = [...obj, objValue]
      }
    }
    set(obj)
  }

  const extend = (initialValue : T | T[] = []) => {
    const w = writable(initialValue);
    substores.push(w)
    rebuild()
    w.subscribe( () => rebuild())
    return w
  }

  return {
    subscribe,
    extend
  }
}



export const debouncable = <T>(millis: number, defaultValue : T)  => {
  let timer : any
	let value = defaultValue
  const { subscribe, set } = writable(defaultValue);

  const flush = () => {
    clearTimeout(timer)
    set(value)
    return value
  }

	return {
		subscribe,
    flush,

    get: flush,

    set: (newValue : T) => {
      value = newValue
      flush()
    },

    lazySet: (newValue : T) => {
      value = newValue
      clearTimeout(timer);
      timer = setTimeout(() => {
        set(value)
      }, millis);
    },
	};
}