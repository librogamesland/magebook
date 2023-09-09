
import { quintIn, quintOut } from 'svelte/easing';
import { slide } from 'svelte/transition';





export const marginFromTop = (node, params) => {
	let h = node.offsetHeight
    return {
			duration: 800,
			easing: quintOut,
			...params,
      css: (t) => `margin-top: ${ - (1-t)*h}px; ${t < 0.4 ? 'box-shadow: none;' : ''}`
    }
}

export const translateFromRight = (node, params) => {
	let w = node.offsetWidth
    return {
			duration: 800,
			easing: quintOut,
			...params,
      css: (t) => `transform: translateX(${ (1-t)*w}px);`
    }
}

export const translateFromBottom = (node, params) => {
	let h = node.offsetHeight
    return {
			duration: 800,
			easing: quintOut,
			...params,
      css: (t) => `transform: translateY(${ (1-t)*h}px);`
    }
}

export const marginFromRight = (node, params) => {
	let w = node.offsetWidth
    return {
			duration: 800,
			easing: quintOut,
			...params,
      css: (t) => `margin-right: ${ -(1-t)*w}px;`
    }
}

export const chooseBetween = (node, params) => {
	return params.choose(node, params)(node, params)
}

export const marginFromLeft = (node, params) => {
	let w = node.offsetWidth
    return {
			duration: 800,
			easing: quintOut,
			...params,
      css: (t) => `margin-left: ${ -(1-t)*w}px;`
    }
}

export const fadeSlim = (node, params) => {
	const slideTrans = slide(node, params)
	return {
		duration: 800,
		easing: quintIn,
		...params,
		css: t => `
			${slideTrans.css(t, null)};
			opacity: ${t ** 2};
		`,
	};
}


