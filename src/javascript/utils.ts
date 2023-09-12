/***
 * Collection of utility functions used by Magebook but not strictly related to it.
 */
import {writable} from 'svelte/store'





/** Generate random string of given lenght.
Default alphabet includes digits, upper and lower case chars. */
export const randomString = (length : number, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let   result           = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}





/** Shuffle array in-place. Taken from https://javascript.info/task/shuffle */
export const shuffleArray = <T>(array : T[])=> {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
}





/** Check if n is natural number */
//@ts-expect-error
export const isNatNumber = (n : number | string) => (n > 0 || String(n) === "0") && Math.floor(n) === +n





/** Debounced Svelte Store
Same as Svelte Stores, but result is updated only if result is stable since millis */
export const debounced = <T>(millis : number, defaultValue: T = null)  => {
  let timer : ReturnType<typeof setTimeout>
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
    set: (newValue: T) => {
      value = newValue
      flush()
    },
    lazySet: (newValue: T) => {
      value = newValue
      clearTimeout(timer);
      timer = setTimeout(() => {
        set(value)
      }, millis);
    },
	};
}





/** Completely absorb and prevent click propagation */
export const preventClickPropagation = (node : HTMLElement) => {
  // Helper function
  const absorbEvent_ = (event : Event) => {
    var e = event || window.event;
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;
  }

  node.ontouchstart = absorbEvent_;
  node.ontouchmove = absorbEvent_;
  node.ontouchend = absorbEvent_;
  node.ontouchcancel = absorbEvent_;
}




export const greekLetters = [
  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
]




/** Find if two segments have and intersection
 https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function */
export const intersects = (a : number,b : number,c :number,d :number, p :number,q :number,r:number,s :number) : boolean => {
  let det :number, gamma:number, lambda :number;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};


export const scaleVector = ([x0, y0], length) => {
  const vectorLength = Math.sqrt(x0*x0 + y0*y0)
  return [
    x0 / vectorLength * length,
    y0 / vectorLength * length,
  ]
}

/** Check if a string may be parsed as number */
export const isNumeric = (str : string) : boolean => {
  if (typeof str != "string") return false // we only process strings!
  // @ts-expect-error
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/** Convert an angle from degree to radians */
export const deg2rad = (angle : number) =>  angle * (Math.PI / 180);

/** Convert an angle from degree to radians */
export const rad2deg = (angle : number) =>  angle / (Math.PI / 180);



/** Get an array with numbers in range. For example,
range(3, 8, 2) => [3, 5, 7 ]  */
export const range = (start : number, stop : number, step : number = 1) => {
	const r = []
	let counter = start;
	while(counter < stop){
		r.push(counter)
		counter += step
	}
	return r
}

/** Execute the callback if and only if the event is mouse */
export const onlyOnMouse = (callback : any) => {
  return (e : any) => {
    if(e.pointerType === "mouse")  callback(e)
  }
}


// wait as promise
export const wait = (ms : number) => new Promise(resolve => setTimeout(resolve, ms));


export const charIndex = (index : number) => String.fromCharCode('A'.charCodeAt(0) + Number(index))
export const indexOfChar = (char : string) => char.charCodeAt(0) - 'A'.charCodeAt(0)


// modulo function
export const mod = (n : number, m : number) => ((n % m) + m) % m

export const inRange = (n: number, min: number, max: number) => n < min ? min : n > max ? max : n

// https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-253.php
export const UUIDGeneratorBrowser = () : string =>// @ts-ignore
([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
  (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
);


