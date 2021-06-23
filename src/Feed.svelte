<script>
import { onMount } from 'svelte';
import InfiniteLoading from 'svelte-infinite-loading';
import { readData, updateData } from './data.js';
import { fromUnixTime, formatDistance } from 'date-fns';
import { toast } from '@zerodevx/svelte-toast';
import { fly } from 'svelte/transition';
import { flip } from 'svelte/animate';
import { quintOut } from 'svelte/easing';

let limit = 20;
let list = [];
let lastTouchedByUpdate = false;

	
function infiniteHandler({ detail : { loaded, complete }}) {
	readData(limit).
	then(rows => {
		if (rows.length == list.length && !lastTouchedByUpdate) {
			complete();
		} else {
			limit += 20;
			list = rows;
			lastTouchedByUpdate = false;
			loaded();
		}
	});
}

function timeAgo(unix) {
	const time = formatDistance(fromUnixTime(unix), new Date(), { addSuffix : true })
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
				readData(limit).
				then(rows => {
					list = rows;
					lastTouchedByUpdate = true;
				}).
				then(toast.push('Yo, someone did something!'))
			}
			list = list; //required to re-render list (aka update relative timestamps)
			});
		}, 120000)
});
	

</script>
<main>
{#await updateData()}
<p>loading...</p>
{:then}
	{#each list as s (s.uid)}
	<div animate:flip="{{duration:3000, easing: quintOut}}">
		<div in:fly="{{duration:3000,x:-500,opacity:0,easing: quintOut}}"
			out:fly="{{duration:2000,x:500,opacity:0,easing: quintOut}}">
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
<InfiniteLoading on:infinite={infiniteHandler} />
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
