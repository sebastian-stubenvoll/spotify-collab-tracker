import { songRequests, playlistRequests } from "./spotify_utils.js";
import { token } from "./spotify_utils";
import { Connection } from "jsstore";
import workerInjector from "jsstore/dist/worker_injector";
import { get } from "svelte/store";
import { filters } from "../stores.js";

//function exports
export async function updateData () {
	await createConnection();
	await initDatabase();
	const playlists = await updatePlaylists();
	const allSongs = await updateSongs(playlists);
	const fC = await getFilterCriteria();
	filterCriteria.update_criteria(fC.users, fC.playlists);
	updateFilterOptions(get(filterCriteria));
	return allSongs['songs'].length != 0
}

export async function readData (limit) {
	const result = await getSongs(limit);
	return result
}


export function deleteData () {
	indexedDB.deleteDatabase('sctdb');
}

export function updateFilterOptions (data) {
		data = data.filter( el => !get(userFilters).includes( el ) );
		data = data.filter( el => !get(playlistFilters).includes( el ) );
		return data
}



//global vars
let connection;
let playlistsTable;
let songsTable;
let db;


//internal functions
async function createConnection() {
	connection = new Connection();
	connection.addPlugin(workerInjector);
}

async function initDatabase() {
	playlistsTable = {
		name: 'playlists',
		columns: {
			id : { primaryKey: true, notNull: true, dataType: 'string' },
			snapshot : { notNull: true, dataType: 'string' }
		}
	};
	
	songsTable = {
		name: 'songs',
		columns: {
			uid : { primaryKey: true, notNull: true, dataType: 'string' },
			unix : { notNull: true, dataType: 'number' },
			subm_name : { notNull: true, dataType: 'string' },
			subm_id : { notNull: true, dataType: 'string' },
			subm_link : { dataType: 'string' },
			subm_images : { dataType: 'object' },
			song_title : { notNull: true, dataType: 'string' },
			song_link : { dataType: 'string' },
			song_popularity : { dataType: 'number' },
			song_duration : { dataType: 'number' },
			song_islocal : { dataType: 'boolean' },
			song_id : { dataType: 'string' },
			album_name : { dataType: 'string' },
			album_link : { dataType: 'string' },
			artists : { notNull: true, dataType: 'array' },
			playlist_name : { notNull: true, dataType: 'string' },
			playlist_link : { notNull: true, dataType: 'string' },
			playlist_id : { notNull: true, dataType: 'string' }
		}
	};

	db = {
		name : 'sctdb',
		tables : [ playlistsTable, songsTable ]
	};

	await connection.initDb(db);
}

//updateFunctions
async function updatePlaylists () {
	//connect to database and grab all playlists
	//SQL: SELECT * FROM playlists
	const playlistsData = await connection.select({
		from: 'playlists'
	});
	let playlists = {};
	playlistsData.forEach(obj => {
		playlists[obj.id] = obj.snapshot;
	});
	//send request to api with current playlist dict
	const json = await playlistRequests(token, playlists);

	//update playlist table with new information
	Object.keys(json['remove']).forEach((key) => {
		//remove playlists from playlist table
		//SQL: DELETE FROM playlists WHERE id=key
		connection.remove({
			from : 'playlists',
			where : {
				id : key
			}
		});
		//remove songs of those playlists from songs table
		//SQL: DELETE FROM songs WHERE playlist_id=key
		connection.remove({
			from : 'songs',
			where : {
				playlist_id : key
			}
		});
	});

	Object.entries(json['update']).forEach((entry) => {
		//add and update new and existing playlists respectively
		const [key, value] = entry;
		const row = {
			'id' : key,
			'snapshot' : value
		};
		//SQL: INSERT INTO playlists (id, snapshot) VALUES (key, value)
		connection.insert({
			into : 'playlists',
			values : [ row ],
			upsert : 'true'
		});
		//SQL: DELETE FROM songs WHERE playlist_id=key
		connection.remove({
			from : 'songs',
			where : {
				playlist_id : key
			}
		});
	});
	//return playlists object from API call for further usage
	return json
};

async function updateSongs (playlists) {
	//use playlists object from updatePlaylists to fetch 
	const json = await songRequests(token, playlists.update);
	//update songs table; API response is designed in a manner
	//such that the songs key holds an array of songs,
	//all of which are objects that match the table row schema
	await connection.insert({
		into : 'songs',
		values: json.songs,
		upsert : 'true' //theoretically not necessary but better safe than sorry!
		});
	return json
};


async function getSongs (l) {
	//base query
	let query = {
		from : 'songs',
		order : {
			by : 'unix',
			type: 'desc'
		},
		limit : l,
		where : {}
	}
	//add filters
	let temp = [];
	f = get(filters);
	f.active.playlists.forEach(element => {temp.push(element.id)});
	const playlist_re = new RegExp(temp.join('|'));
	if (playlist_re != '') { query.where.playlist_id = { regex : playlist_re } }

	temp = [];
	f.active.users.forEach(element => {temp.push(element.id)});
	const user_re = new RegExp(temp.join('|'));
	if (user_re != '') { query.where.subm_id = { regex : user_re } }

	if ( query.where === {} ) { delete query.where };
	//SQL: SELECT * FROM songs ORDER BY unix DESC LIMIT l
	const result = await connection.select(query);
	return result
}


async function getFilterCriteria () {
	const users = await connection.select({
		from : 'songs',
		groupBy : 'subm_name'
	});

	const playlists = await connection.select({
		from : 'songs',
		groupBy : 'playlist_name'
	});

	return { users, playlists }
}
