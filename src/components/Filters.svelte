<script>
	import { readData } from '../utils/data.js';
	import { filters, limit, list, lastTouchedByUpdate, flyDelay } from '../stores.js'; 
	import Typeahead from 'svelte-typeahead';

	export let infiniteId;

	const extract = (item) => item.data.name;

	let structureFilters = function(criteria) {
		let users = [];
		let playlists = [];
		criteria.users.forEach((x, _) => users = [...users, {'type' : 'users', 'data' : x}]);
		criteria.playlists.forEach((x, _) => playlists = [...playlists, {'type' : 'playlists', 'data' : x}]);
		return [...users, ...playlists]
	};

	let data = structureFilters($filters.criteria);

	function applyFilter() {
		readData($limit).
		then(rows => {
				flyDelay.set(1000);
				list.set(rows);
				lastTouchedByUpdate.yes();
			})
	}

	function addFilter(item) {
		filters.add(item.type, item.data);
		applyFilter();
	}

	function removeFilter(type, item) {
		filters.delete(type, item);
		infiniteId = Symbol();
		applyFilter();
	}

	function decodeType(type) {
		return 'in ' + 	type
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
{#each $filters.active.users as u}
	<button on:click={() => {removeFilter('users', u)}}> {u.name} </button>
{/each}
{#each $filters.active.playlists as p}
	<button on:click={() => {removeFilter('playlists', p)}}> {p.name} </button>
{/each}
</div>


<style>
:global([data-svelte-search] input) {
  font-size: 1rem;
  text-align: center;
  border: 0px !important;
}

:global([data-svelte-typeahead]) {
  margin: 0 auto;
  padding-top: 2em;
  width: 80%;
  position: relative;
  z-index: 9999;
  background-color: rgba(0,0,0,0);
  max-width: 50em;
}

	.filter-buttons {
		position: relative;
		padding: 1em;
	}

	.category-info {
		font-style: italic;
		color: #807c7c;
		}

	button {
		margin: 0.3em;
		background-color: indianred;
		color: white;
		border-color: rgba(0,0,0,0);
	}

</style>


