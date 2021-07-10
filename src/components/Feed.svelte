<script>
	import { onMount } from 'svelte';
	import InfiniteLoading from 'svelte-infinite-loading';
	import { readData, updateData } from '../utils/data.js';
	import { formatDistance } from 'date-fns';
	import { toast } from '@zerodevx/svelte-toast';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { pushURL } from '../../settings.js';
	import { limit, list, lastTouchedByUpdate } from '../stores.js';
	import Filters from './Filters.svelte';

	console.log('limit', $limit);

	//remove auth url params
	history.pushState({}, 'feed', pushURL);

	function infiniteHandler({ detail : { loaded, complete }}) {
		readData($limit).
			then(rows => {
				if (rows.length == $list.length && $lastTouchedByUpdate == false) {
					complete();
				} else {
					console.log('calling load feed');
					console.log(rows);
					limit.increment();
					console.log($limit);
					list.set(rows);
					lastTouchedByUpdate.no();
					loaded();
				}
			});
	}

	function timeAgo(unix) {
		const time = formatDistance(new Date(unix), new Date(), { addSuffix : true })
		return time
	}

	function checkSeperator(artists, i) {
		if (artists.length-1 == i) {return ''}
		else if (artists.length-2 == i) {return ' & '}
		else {return ', '}}

	onMount(() => {
		setInterval(() => {
			console.log('Fetching new data...');
			updateData().then(result => {
				if (result) {
					readData($limit).
						then(rows => {
							list.set(rows);
							lastTouchedByUpdate.yes();
						}).
						then(toast.push('Yo, someone did something!'))
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
		<Filters/>
		{#each $list as s (s.uid)}
			<div animate:flip="{{duration:2000, easing: quintOut}}">
			<div in:fly="{{duration:3000,x:-300,opacity:0,easing: quintOut}}">
				<h1><a href={s.song_link} target='_blank'>{s.song_title}</a></h1>
				<h2>by 
					{#each s.artists as {name, link}, i}
						<a href={link} target='_blank'>{name}</a>{checkSeperator(s.artists, i)}
					{/each}
				</h2>
				<h3>added to <a href={s.playlist_link} target='_blank'>{s.playlist_name}</a> 
					by <a href={s.subm_link} target='_blank'><b>{s.subm_name}</b></a> {timeAgo(s.unix)}
				</h3>
				<br>
				<br>
			</div>
			</div>
		{/each}
		<InfiniteLoading on:infinite={infiniteHandler} spinner='wavedots' />
	{/await}
</main>

<style>

	h1 {
		color: indianred;
		font-size: 2em;
	}

	h2 {
		color: dimgrey;	
		font-size: 1.5em;
	}

	h3 {
		color: dimgrey;
		font-size: 1em;
	}

	a {
		color: indianred;
	}	

</style>
