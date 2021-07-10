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

function createFilterCriteria() {
	const { subscribe, update } = writable({ playlists : {}, users : {} });

	return {
		subscribe,
		update_playlists: (data) => update(criteria => {
			const playlists = [];
			data.forEach(entry => {
				playlists.push({ id : entry.playlist_id, name : entry.playlist_name });
			});
			criteria.playlists = playlists;
			return criteria
		}),
		update_users: (data) => update(criteria => {
			const users = [];
			data.forEach(entry => {
				users.push({ id : entry.subm_id, name : entry.subm_name });
			});
			criteria.users = users;
			return criteria
		})
	}
}

function createPlaylistFilters() {
	const { subscribe, set, update } = writable([]);

	return { 
		subscribe,
		add: (pl) => update(li => { 
			if ( !li.includes(pl) ) { return [...li, pl] } else { return li }
		}),
		delete: (pl) => update(li => {
			if ( li.includes(pl) ) { return arrayRemove(li, pl) } else { return li }
		}),
		toggle: (pl) => update(li => {
			if ( li.includes(pl) ) { return arrayRemove(li, pl) } else { return [...li, pl] }
		}),
		reset: () => set([])
	};
}

function createUserFilters() {
	const { subscribe, set, update } = writable([]);

	return { 
		subscribe,
		add: (u) => update(li => { 
			if ( !li.includes(u) ) { return [...li, u] } else { return li }
		}),
		delete: (u) => update(li => {
			if ( li.includes(u) ) { return arrayRemove(li, u) } else { return li }
		}),
		toggle: (u) => update(li => {
			if ( li.includes(u) ) { return arrayRemove(li, u) } else { return [...li, u] }
		}),
		reset: () => set([])
	};
}

export const limit = createLimit();
export const list = createList();
export const lastTouchedByUpdate = createLastTouchedByUpdate();
export const filterCriteria = createFilterCriteria();
export const playlistFilters = createPlaylistFilters();
export const userFilters = createUserFilters();
