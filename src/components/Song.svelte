<script>
	import { formatDistance } from 'date-fns';

	export let song_link;
	export let song_title;
	export let artists;
	export let playlist_name;
	export let playlist_link;
	export let playlist_id;
	export let uid;
	export let song_popularity;
	export let song_duration;
	export let song_islocal;
	export let song_id;
	export let album_name;
	export let album_link;
	export let subm_id;
	export let subm_images;
	export let subm_link;
	export let subm_name;
	export let unix;

		function timeAgo(unix) {
		const time = formatDistance(new Date(unix), new Date(), { addSuffix : true })
		return time
	}

	function checkSeperator(artists, i) {
		if (artists.length-1 == i) {return ''}
		else if (artists.length-2 == i) {return ' & '}
		else {return ', '}}



</script>


<h1><a href={song_link} target='_blank'>{song_title}</a></h1>
	<h2>by 
		{#each artists as {name, link}, i}
			<a href={link} target='_blank'>{name}</a>{checkSeperator(artists, i)}
		{/each}
	</h2>
	<h3>added to <a href={playlist_link} target='_blank'>{playlist_name}</a> 
		by <a href={subm_link} target='_blank'><b>{subm_name}</b></a> {timeAgo(unix)}
	</h3>
	<br>
	<br>


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
