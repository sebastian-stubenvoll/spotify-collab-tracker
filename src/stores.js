import { writable } from 'svelte/store';


function arrayRemove(arr, value) { 

	return arr.filter(function(ele){ 
		return ele != value; 
	});
}

function createLimit() {
	const { subscribe, set, update } = writable(20);
	
	return {
		subscribe,
		increment: () => update(x => x + 20),
		reset: () => set (20)
	}
}

function createList() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		set,
		refresh: () => update(li => li)
	}
}

function createLastTouchedByUpdate() {
	const { subscribe, set } = writable(false);

	return {
		subscribe,
		yes: () => set(true),
		no: () => set(false)
	}
}


function createFilters() {
	const { subscribe, set, update } = writable({
		criteria: {
			users: [],
			playlists: []
		},
		active: {
			users: [],
			playlists: []
		},
	})

	// Filter methods take two arguments, the filter type and the element
	return {
		subscribe,
		update_criteria : (u, p) => update(filters => {
			const users = [];
			const playlists = [];
			u.forEach(entry => {
				users.push({
					id : entry.subm_id,
					name : entry.subm_name,
				})
			});
			p.forEach(entry => {
				playlists.push({
					id : entry.playlist_id,
					name : entry.playlist_name,
				})
			});
			filters.criteria.users = users;
			filters.criteria.playlists = playlists;
			return filters
		}),
		add : (newf, type) => update(filters => {
			if (!filters.active[type].includes(newf)) {
				filters.active[type] = [ ...filters.active[type], newf ];
			}
			return filters
		}),
		delete : (newf, type) => update(filters => {
			if (filters.active[type].includes(newf)) {
				filters.active[type] = arrayRemove(filters.active[type], newf);
			}
			return filters
		}),
		toggle : (newf, type) => update(filters => {
			if (!filters.active[type].includes(newf)) {
				filters.active[type] = [ ...filters.active[type], newf ];
			} else {
				filters.active[type] = arrayRemove(filters.active[type], newf);
			}
			return filters
		}),
		reset : () => update(filters => {
			filters.active.users = [];
			filters.active.playlists = [];
			return filters
		})
	}
}

export const limit = createLimit(); //DB fetch limit
export const list = createList(); //DB results
export const lastTouchedByUpdate = createLastTouchedByUpdate(); //??
export const filters = createFilters(); //filter management
export const flyDelay = writable(0);
