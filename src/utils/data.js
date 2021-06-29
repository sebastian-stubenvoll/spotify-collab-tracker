import { songRequests, playlistRequests } from "./spotify_utils.js";
import { token } from "./spotify_utils";
import { Connection } from "jsstore";
import workerInjector from "jsstore/dist/worker_injector";

//exports
export async function updateData () {
	await createConnection();
	await initDatabase();
	const playlists = await updatePlaylists();
	const allSongs = await updateSongs(playlists);
	return allSongs['songs'].length != 0
};

export async function readData (limit) {
	const result = await getSongs(limit);
	return result
};


export function deleteData () {
	indexedDB.deleteDatabase('sctdb');
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
			uid : { primaryKey: true, dataType: 'string' },
			unix : { dataType: 'number' },
			subm_name : { dataType: 'string' },
			subm_id : { dataType: 'string' },
			subm_link : { dataType: 'string' },
			subm_images : { dataType: 'object' },
			song_title : { dataType: 'string' },
			song_link : { dataType: 'string' },
			song_popularity : { dataType: 'number' },
			song_duration : { dataType: 'number' },
			song_islocal : { dataType: 'boolean' },
			song_id : { dataType: 'string' },
			album_name : { dataType: 'string' },
			album_link : { dataType: 'string' },
			artists : { dataType: 'array' },
			playlist_name : { dataType: 'string' },
			playlist_link : { dataType: 'string' },
			playlist_id : { dataType: 'string' }
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
			values : [ row ]
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
		values: json.songs
		});
	//for temporary testing!
	return json
};


async function getSongs (l) {
	//SQL: SELECT * FROM songs ORDER BY unix DESC LIMIT l
	const result = await connection.select({
		from : 'songs',
		order : {
			by : 'unix',
			type: 'desc'
		},
		limit : l
	});
	return result
}



