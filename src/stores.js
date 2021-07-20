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

function createFilterAction() {
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
		update_criteria : (u, p) => update(criteria => {
			const users = [];
			u.forEach(entry => {
				users.push({ id : entry.subm_id, name : entry.subm_name, type : 0 });
			});
			const playlists = [];
			p.forEach(entry => {
				playlists.push({ id : entry.playlist_id, name : entry.playlist_name, type : 1 });
			});
			return [...users, ...playlists]
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
		delete: (pl) => update(li => { if ( li.includes(pl) ) { return arrayRemove(li, pl) } else { return li }
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
export const filterAction = createFilterAction();
export const filterCriteria = createFilterCriteria();
export const playlistFilters = createPlaylistFilters();
export const userFilters = createUserFilters();
