<script>
	import Feed from './components/Feed.svelte';
	import Login from './components/Login.svelte';

	import { SvelteToast } from '@zerodevx/svelte-toast';
	import Modal from './components/Modal.svelte';

	import { getAccessToken } from './utils/spotify_utils.js';
	import queryString from 'query-string';

	const options = { duration: 10000 }
	let token_valid;

	async function checkToken () {
		const paramCheck = await getParams();
		if (!paramCheck) {
			token_valid = false;
			return
		}
		token_valid = true;
	}			

	async function getParams () {
		if (typeof window !== 'undefined') {
			const parsed = queryString.parse(window.location.search);
			if (parsed.code) {
				const success = await getAccessToken(parsed);
				if (success) {
					return true
				}
			}
		}
		return false
	}

	const validity = checkToken();

</script>

	<Modal>
	<main>
		{#await validity}
			checking spotify access!
		{:then}
			{#if !token_valid}
				<Login/>
			{:else}
				<Feed/>
			{/if}
		{/await}
	</main>
	<SvelteToast {options}/>
	</Modal>

<style>
	:root {
		--toastBackground: indianred;
		--toastColor: white;
		--toastProgressBackground: white;
	}

	@media (min-width: 640px) {
	main {
		max-width: none;
	}
	}
</style>
