import { writable } from "svelte/store";

// Detect orientation change in JavaScript
export const portraitChecker = window.matchMedia('(orientation: portrait)');


export const portrait = writable(portraitChecker.matches)

portraitChecker.addEventListener('change', (event) => {
  portrait.set(event.matches)
});