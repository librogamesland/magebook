import { writable, type Updater, type Subscriber } from 'svelte/store'
import queryString from 'query-string'


import fixed    from '../assets/img/flags/fixed.png'
import noexport from '../assets/img/flags/noexport.png'
import final    from '../assets/img/flags/final.png'
import death    from '../assets/img/flags/death.png'
import genericFlag from '../assets/img/flags/generic.png'
import type { Book } from './book-utils'


export const flagsURLs: Record<string, string> = {fixed, noexport, final, death }

export const trimmedFlag = (flag : string) => flag.substring(0, flag.indexOf(':') !== -1 ? flag.indexOf(':') : Infinity )

export const flagURL = (flag : string, book : Book) : string => {
  flag = trimmedFlag(flag)
  return flagsURLs[flag] ?? book.index.properties['flag-' + flag] ?? genericFlag
}

export const urlOfChapterKey = (chapterKey : string) => {
  return location.href + '&c=' + encodeURIComponent(chapterKey)
}


/**
 * URL Parameter Management Functions
 */


/**
 * Returns the first element of an array if 's' is an array with elements,
 * or 's' itself if it's a single value.
 */
//@ts-expect-error
export const getLast = (s: string | (string | null)[] | null): string | null => s === null ? null : (Array.isArray(s) && s.length > 0) ? s[s.length - 1] : s;


/**
 * Manages multiple URL parameters with the following functions:
 *
 * - set(params): Sets URL parameters using an object.
 * - update(updateFunction): Updates URL parameters using a custom function.
 * - subscribe: Subscribes to URL parameter changes.
 *
 * Example Usage:
 * urlParams.set({ page: 'home', category: 'news' });
 * urlParams.update((currentParams) => {
 *   currentParams.page = 'about';
 *   return currentParams;
 * });
 */
export const urlParams =  (() => {
  let value = queryString.parse(location.hash);
  const { set, subscribe } = writable(value);

  window.addEventListener('hashchange', () => {
    value = queryString.parse(location.hash);
    set(value);
  });

  const change = (subscriber: Subscriber<typeof value>) => {
    return subscribe( (newValue) => {
      if(value === newValue) return;
      subscriber(newValue);
    })
  }
  return {
    get: (key : string) => getLast(value[key]),
    get value(){return value;},
    set(params : Record<string, any>) {
      location.hash = '#' + queryString.stringify(params);
    },
    update (updateFunction: (currentParams: Record<string, any>) => Record<string, any>) {
      const newParams = updateFunction(queryString.parse(location.hash));
      location.hash = '#' + queryString.stringify(newParams);
    },
    subscribe,
    change
  }
})()


/**
 * Manages a single URL parameter by key with the following functions:
 *
 * - set(newValue): Sets the value of the URL parameter.
 * - update(updateFunction): Updates the URL parameter using a custom function.
 * - subscribe: Subscribes to changes in the URL parameter.
 *
 * It's guaranteed that the subscribe function will only be called when the URL parameter
 * is different from the current value.
 *
 * Example Usage:
 * const pageParam = urlParam('page');
 * pageParam.set('about');
 * pageParam.update((currentPage) => {
 *   return 'contact';
 * });
 */
export const urlParam = (key : string) => {

  let value : string  | null = getLast(queryString.parse(location.hash)[key]);
  const { set, subscribe } = writable(value);


  // TODO: actually we should unsubscribe at the end
  urlParams.subscribe((params) => {
    const newValue = getLast(params[key]);
    if (newValue!== value) {
          set(newValue);
    }
  })

  const newSet = (newValue: string | null) => {
    if(value === newValue) return;
    value = newValue;
    urlParams.update((params) => {
      params[key] = newValue;
      return params;
    })
  }

  const newUpdate = (updateFunction : Updater<typeof value> ) => {
    const newValue = updateFunction(value);
    newSet(newValue);
    return newValue;
  }

  const change = (subscriber: Subscriber<typeof value>) => {
    return subscribe( (newValue) => {
      if(value === newValue) return;
      subscriber(newValue);
    })
  }

  return {
    get: () => value,
    get value(){return value;},
    set: newSet,
    update: newUpdate,
    subscribe,
    change,
  }
}


