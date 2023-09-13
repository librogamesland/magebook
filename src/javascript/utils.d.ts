/// <reference types="svelte" />
/** Generate random string of given lenght.
Default alphabet includes digits, upper and lower case chars. */
export declare const randomString: (length: number, characters?: string) => string;
/** Shuffle array in-place. Taken from https://javascript.info/task/shuffle */
export declare const shuffleArray: <T>(array: T[]) => void;
/** Check if n is natural number */
export declare const isNatNumber: (n: number | string) => boolean;
/** Debounced Svelte Store
Same as Svelte Stores, but result is updated only if result is stable since millis */
export declare const debounced: <T>(millis: number, defaultValue?: T) => {
    subscribe: (this: void, run: import("svelte/store").Subscriber<T>, invalidate?: import("svelte/store").Invalidator<T>) => import("svelte/store").Unsubscriber;
    flush: () => T;
    get: () => T;
    set: (newValue: T) => void;
    lazySet: (newValue: T) => void;
};
/** Completely absorb and prevent click propagation */
export declare const preventClickPropagation: (node: HTMLElement) => void;
export declare const greekLetters: string[];
/** Find if two segments have and intersection
 https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function */
export declare const intersects: (a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) => boolean;
export declare const scaleVector: ([x0, y0]: [any, any], length: any) => number[];
/** Check if a string may be parsed as number */
export declare const isNumeric: (str: string) => boolean;
/** Convert an angle from degree to radians */
export declare const deg2rad: (angle: number) => number;
/** Convert an angle from degree to radians */
export declare const rad2deg: (angle: number) => number;
/** Get an array with numbers in range. For example,
range(3, 8, 2) => [3, 5, 7 ]  */
export declare const range: (start: number, stop: number, step?: number) => any[];
/** Execute the callback if and only if the event is mouse */
export declare const onlyOnMouse: (callback: any) => (e: any) => void;
export declare const wait: (ms: number) => Promise<unknown>;
export declare const charIndex: (index: number) => string;
export declare const indexOfChar: (char: string) => number;
export declare const mod: (n: number, m: number) => number;
export declare const inRange: (n: number, min: number, max: number) => number;
export declare const UUIDGeneratorBrowser: () => string;
