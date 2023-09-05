import { writable } from 'svelte/store';


export const debouncable = (millis, defaultValue = null)  => {
  let timer
	let value = defaultValue
  const { subscribe, set, update } = writable(defaultValue); 

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