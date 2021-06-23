<script>
import { createAuthURL } from './spotify_utils.js';
import { fly } from 'svelte/transition';
import { quadOut } from 'svelte/easing';
import { getContext } from 'svelte';
import About from './About.svelte';

const authURL = createAuthURL();
let y;
const { open } = getContext('simple-modal')

const showAbout = () => open(About)


</script>
<svelte:window bind:innerHeight={y}/>

{#await authURL}
<h1> </h1>
{:then url}
<h1>
<p in:fly="{{duration: 2000, y:y/2, opacity:0, easing:quadOut}}">
<a href={url}>login with spotify</a>
<br>
<button>privacy</button><button on:click={showAbout}>about</button>
</p>
</h1>
{/await}

<style>
	h1 {
		color: indianred;
		font-size: 4em;
		margin: 0;
		position: relative;
		top: 40%;
	}

	a {
		color: indianred;
	}
	a:hover {
		text-decoration: none;
	}

	button {
		font-size: 0.4em;
		background: none;
		color: indianred;
		padding: 0.6em;
		border: none;
		cursor: pointer;
	}

	button:hover {
		text-decoration: none;
	}

	button:focus {
		background: none;
	}
</style>






