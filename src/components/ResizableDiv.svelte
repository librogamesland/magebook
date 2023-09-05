
<script lang="ts">
  import { fade } from "svelte/transition";
	import { translateFromBottom, translateFromRight, chooseBetween } from "../javascript/transitions";
	import { portrait } from "../javascript/utils";


	let clazz : string;
	export { clazz as class };

	export let right = false
	$: bottom = right
	export let width = Math.min(500, screen.width * 0.4);
	export let height = Math.min(500, screen.height * 0.5);

	let startingFromWidth = 0
	let startingFromHeight = 0

	const resize = (e : MouseEvent | TouchEvent) => {
		if($portrait){
			const y = ("touches" in e) ? e.changedTouches[0].pageY : e.y
			height = bottom ? (startingFromHeight - y) : (startingFromHeight + y)
		}else{
			const x = ("touches" in e) ? e.changedTouches[0].pageX : e.x
			width = right ? (startingFromWidth - x) : (startingFromWidth + x)
		}
	}

	const handleResize = (e : MouseEvent | TouchEvent) => {
		if($portrait){
			const y = ("touches" in e) ? e.changedTouches[0].pageY : e.y
			startingFromHeight = bottom ? (y + height) : (y - height)
		}else{
			const x = ("touches" in e) ? e.changedTouches[0].pageX : e.x
			startingFromWidth = right ? (x + width) : (x - width)
		}

		if("touches" in e){
				document.addEventListener("touchmove", resize, false);
				document.addEventListener("touchend", () => {
						document.removeEventListener("touchmove", resize, false);
				}, {once: true});
		}else{
				document.addEventListener("mousemove", resize, false);
				document.addEventListener("mouseup", () => {
						document.removeEventListener("mousemove", resize, false);
				}, {once: true});
		}
	}

</script>

{#if right}
  <div class="landscape:cursor-col-resize portrait:cursor-row-resize box-shadow: 0 0 20px 20px rgb(0 0 0 / 12%);" on:touchstart={handleResize} on:mousedown|preventDefault|stopPropagation={handleResize}
    in:fade={({
    delay: 1200,
  })}>
    <slot name="resizable">
      <div class="landscape:w-[8px] portrait:h-[8px] landscape:cursor-col-resize portrait:cursor-row-resize"></div>
    </slot>
  </div>
{/if}


<div class={`${clazz}`} style={`${$portrait ? `height: ${height}px;` : `width: ${width}px;`} overflow: auto; flex-shrink: 0;`} 
in:chooseBetween={({
	choose: () => $portrait ? translateFromBottom : translateFromRight,
  duration: 1300,
})}>
  <slot></slot>
</div>

{#if !right}
  <div class="landscape:w-[8px] portrait:h-[8px] landscape:cursor-col-resize portrait:cursor-row-resize" on:touchstart|preventDefault|stopPropagation={handleResize} on:mousedown|preventDefault|stopPropagation={handleResize}></div>
{/if}


