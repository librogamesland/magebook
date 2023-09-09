import { writable } from 'svelte/store';


export const debouncable = (millis: number, defaultValue = null)  => {
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

    set: (newValue) => {
      value = newValue
      flush()
    },

    lazySet: (newValue) => {
      value = newValue
      clearTimeout(timer);
      timer = setTimeout(() => {
        set(value)
      }, millis);
    },
	};
}