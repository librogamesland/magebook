import { writable } from 'svelte/store';


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