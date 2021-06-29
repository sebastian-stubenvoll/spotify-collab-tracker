<script>
	export let onClose;
</script>

<button on:click={onClose}>×</button>

<style>
	button {
		border: none;
		background: none;
		position: absolute;
		top: 0rem;
		right: 0.9rem;
		z-index: 1000;
		border-radius: 100%;
		font-size: 1.5em;
	}

	button:active {
		background: none;
	}
</style>
