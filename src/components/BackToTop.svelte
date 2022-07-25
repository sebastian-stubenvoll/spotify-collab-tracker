<script >
	export let showOnPx = 250;
	let hidden = true;

	function goTop() {
		document.body.scrollIntoView({ behavior : "smooth" });
	}

	function scrollContainer() {
		return document.documentElement || document.body;
	}

	function onScroll() {
		if (!scrollContainer()) {
			return;
		}

		hidden = !(scrollContainer().scrollTop > showOnPx);
	}
</script>


<svelte:window on:scroll={onScroll} />

<div class="top-button" on:click={goTop} class:hidden>↑</div>


<style> 
	.top-button {
		opacity: 1;
		transition: opacity 0.5s, visibility 0.5s;
		position: fixed;
		z-index: 99;
		right: 20px;
		user-select: none;
		bottom: 20px;
		padding: 2%;
		background-color: indianred;
	}
	
	.top-button.hidden {
		opacity: 0;
		visibility: hidden;
	}
	
</style>

