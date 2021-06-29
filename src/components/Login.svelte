<script>
	import { createAuthURL } from '../utils/spotify_utils.js';
	import { fly } from 'svelte/transition';
	import { quadOut } from 'svelte/easing';
	import { getContext } from 'svelte';
	import About from '../modals/About.svelte';
	import Privacy from '../modals/Privacy.svelte';
	import CloseButton from '../modals/CloseButton.svelte';

	const authURL = createAuthURL();
	let y;
	const { open } = getContext('simple-modal')

	const showAbout = () => open(About, {}, {closeButton: CloseButton});
	const showPrivacy = () => open(Privacy, {}, {closeButton: CloseButton});


</script>

<svelte:head>
	<link rel="stylesheet" href="login.css">
</svelte:head>

<svelte:window bind:innerHeight={y}/>

{#await authURL}
	<h1> </h1>
{:then url}
	<h1>
		<p in:fly="{{duration: 2000, y:y/3, opacity:0, easing:quadOut}}">
			<a href={url}>login with spotify</a>
			<br>
			<button on:click={showPrivacy}>privacy</button><button on:click={showAbout}>about</button>
		</p>
	</h1>
{/await}

<style>
	h1 {
		color: #f1f2f0;
		font-size: 4em;
		margin: 0;
		position: relative;
		top: 10%;
	}

	a {
		color: #f1f2f0;
	}
	a:hover {
		text-decoration: none;
	}

	button {
		font-size: 0.4em;
		background: none;
		color: #f1f2f0;
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






