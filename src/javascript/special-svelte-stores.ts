import { get, writable, type Writable } from 'svelte/store';

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