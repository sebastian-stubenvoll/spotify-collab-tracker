<script>
	import { readData } from "../utils/data.js";
	import { filterCriteria, playlistFilters, userFilters, limit, list, lastTouchedByUpdate } from "../stores.js"; 

	function test(pl) {
		playlistFilters.toggle(pl);
		let current = [];
		$playlistFilters.forEach(x => {
			current.push(x.name);
		});
		console.log(current);
		readData($limit)
			.then(rows => {
				list.set(rows);
				lastTouchedByUpdate.yes();
			});
	}

	function test2(pl) {
		userFilters.toggle(pl);
		let current = [];
		$userFilters.forEach(x => {
			current.push(x.name);
		});
		console.log(current);
		readData($limit)
			.then(rows => {
				list.set(rows);
				lastTouchedByUpdate.yes();
			});
	}
</script>

{#each $filterCriteria.playlists as pl}
	<button on:click={() => test(pl)}>{pl.name}</button>
{/each}
{#each $filterCriteria.users as u}
	<button on:click={() => test2(u)}>{u.name}</button>
{/each}
