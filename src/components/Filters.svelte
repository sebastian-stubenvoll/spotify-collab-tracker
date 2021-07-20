<script>
	import { readData, updateFilterOptions } from "../utils/data.js";
	import { filterCriteria, playlistFilters, userFilters, limit, list, lastTouchedByUpdate, flyDelay } from "../stores.js"; 
	import Typeahead from "svelte-typeahead";

	const extract = (item) => item.name;
	let data = $filterCriteria


	function applyFilter() {
		readData($limit).
			then(rows => {
				flyDelay.set(1000);
				list.set(rows);
				lastTouchedByUpdate.yes();
			})
	}

	function addFilter(item) {
		if (item.type == 0) {
			userFilters.add(item);
		} else if (item.type == 1) {
			playlistFilters.add(item);
		}
		applyFilter();
		updateFilterOptions($filterCriteria);
	}

	function removeFilter(item) {
		if (item.type == 0) {
			userFilters.delete(item);
		} else if (item.type == 1) {
			playlistFilters.delete(item);
		}
		applyFilter();
		updateFilterOptions($filterCriteria);
	}

	function decodeType(type) {
		switch (type) {
			case 0:
				return 'in users'
			case 1:
				return 'in playlists'
			}
		}

</script>




<Typeahead 
	{data}
	{extract}
	limit=5
	on:select={(e) => {addFilter(e.detail.original)}}
	inputAfterSelect="clear"
	placeholder="search for filters..."
	hideLabel=true
	autoselect=false
	let:result>
	{@html result.string} <span class="category-info">{decodeType(result.original.type)}</span>
</Typeahead>

<div class='filter-buttons'>
{#each $userFilters as u}
	<button on:click={() => {removeFilter(u)}}> {u.name} </button>
{/each}
{#each $playlistFilters as p}
	<button on:click={() => {removeFilter(p)}}> {p.name} </button>
{/each}
</div>


<style>
:global([data-svelte-search] input) {
  font-size: 1rem;
  text-align: center;
  border: 0px !important;
}

:global([data-svelte-typeahead]) {
  margin: 1rem;
  position: relative;
  z-index: 9999;
  background-color: rgba(0,0,0,0);
}

	.filter-buttons {
		width: 50%;
		margin: 0 auto;
	}

	.category-info {
		font-style: italic;
		color: #807c7c;
		}

	button {
		padding: 0.4em;
		background-color: indianred;
		color: white;
		border-color: rgba(0,0,0,0);
	}

</style>


