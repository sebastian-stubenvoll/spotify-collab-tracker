<script>
	import { onMount } from 'svelte';
	import InfiniteLoading from 'svelte-infinite-loading';
	import { readData, updateData } from '../utils/data.js';
	import { toast } from '@zerodevx/svelte-toast';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { pushURL } from '../../settings.js';
	import { limit, list, lastTouchedByUpdate, flyDelay } from '../stores.js';
	import Filters from './Filters.svelte';
	import Song from './Song.svelte';
	import BackToTop from './BackToTop.svelte';

	//Reassigning will trigger a reload of the InfiniteLoading component
	//This should be done when removing filters as to reset the handler
	let infiniteId = Symbol();


	//remove auth url params
	history.pushState({}, 'feed', pushURL);

	function infiniteHandler({ detail : { loaded, complete }}) {
		readData($limit).
			then(rows => {
				if (rows.length == $list.length && $lastTouchedByUpdate == false) {
					complete();
				} else {
					limit.increment();
					flyDelay.set(0);
					list.set(rows);
					lastTouchedByUpdate.no();
					loaded();
				}
			});
	}

	onMount(() => {
		setInterval(() => {
			console.log('Fetching new data...');
			updateData().then(result => {
				if (result) {
					readData($limit).
						then(rows => {
							flyDelay.set(400);
							list.set(rows);
							lastTouchedByUpdate.yes();
						}).
						then(toast.push(`something happened!`))
				}
			});
		}, 120000)
		setInterval(() => {
			list.refresh();
		}, 60000)
	});
</script>

<main>
	{#await updateData()}
		<p>fetching your collaborative playlists from spotify.
			<br>
			<br>
			if this is your first time launching this page, this might take a while.
		</p>
	{:then}
		<Filters bind:infiniteId={infiniteId}/>
		<div class="box">
		{#each $list as s (s.uid)}
			<div animate:flip="{{duration:2000, easing: quintOut, delay: 150}}">
				<div in:fly="{{duration:3000,x:-300,opacity:0,easing: quintOut, delay: $flyDelay}}"> 
					<div out:fly="{{duration:1000,x:300,easing: quintOut}}">
						<Song {...s} />

					</div>
				</div>
			</div>
		{/each}
		</div>
		<InfiniteLoading on:infinite={infiniteHandler} identifier={infiniteId} spinner='wavedots'>
			<span slot="noMore">
				that's all folks!
			</span>
			<span slot="noResults">
				that's all folks!
			</span>
		</InfiniteLoading>
	{/await}

	<BackToTop />
</main>

<style>
	.box {
		display: flex;
		flex-direction: column;
	}
</style>
