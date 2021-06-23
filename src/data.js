import lovefield from "lovefield";
import { songRequests, playlistRequests } from "./spotify_utils";
import { token } from "./spotify_utils";

export const updateData = async function () {
	await createDatabase();
	await initDatabase();
	await initVars();
	const playlists = await updatePlaylists();
	const allSongs = await updateSongs(playlists);
	return allSongs['songs'].length != 0
};

export const readData = async function(limit) {
	const result = await getSongs(limit);
	return result
	};

let schemaBuilder;
let userData;
let playlistsTable;
let songsTable;

async function createDatabase() {
	schemaBuilder = lf.schema.create('sctdb',1); 
	}
	
async function initDatabase() {
	schemaBuilder.createTable('playlists').
		addColumn('id', lf.Type.STRING).
		addColumn('snapshot', lf.Type.STRING).
		addPrimaryKey(['id']);
	schemaBuilder.createTable('songs').
		addColumn('uid', lf.Type.STRING).
		addColumn('unix', lf.Type.INTEGER).
		addColumn('subm_name', lf.Type.STRING).
		addColumn('subm_id', lf.Type.STRING).
		addColumn('subm_link', lf.Type.STRING).
		addColumn('subm_images', lf.Type.OBJECT).
		addColumn('song_title', lf.Type.STRING).
		addColumn('song_link', lf.Type.STRING).
		addColumn('song_popularity', lf.Type.INTEGER).
		addColumn('song_duration', lf.Type.STRING).
		addColumn('song_islocal', lf.Type.BOOLEAN).
		addColumn('song_id', lf.Type.STRING).
		addColumn('album_name', lf.Type.STRING).
		addColumn('album_link', lf.Type.STRING).
		addColumn('artists', lf.Type.OBJECT).
		addColumn('playlist_name', lf.Type.STRING).
		addColumn('playlist_link', lf.Type.STRING).
		addColumn('playlist_id', lf.Type.STRING).
		addPrimaryKey(['uid']);
	}

//assign variables for use with various functions
async function initVars() {
	const db = await schemaBuilder.connect();
	userData = db;
	playlistsTable = userData.getSchema().table('playlists');
	songsTable = userData.getSchema().table('songs');
	};
	
//updateFunctions
const updatePlaylists = async function () {
		//connect to database and grab all playlists
		const playlistsData = await userData.select().from(playlistsTable).exec();
		let playlists = {};
		playlistsData.forEach(obj => {
			playlists[obj.id] = obj.snapshot;
			});
		//send request to api with current playlist dict
		const json = await playlistRequests(token, playlists);

		//update playlist table with new information
		Object.keys(json['remove']).forEach((key) => {
			//remove playlists from playlist table
			userData.
			delete().
			from(playlistsTable).
			where(playlistsTable.id.eq(key)).
			exec();

			//remove songs of those playlists from songs table
			userData.
			delete().
			from(songsTable).
			where(songsTable.playlist_id.eq(key)).
			exec();
		});

		Object.entries(json['update']).forEach((entry) => {
			//add and update new and existing playlists respectively
			const [key, value] = entry;
			const row = playlistsTable.createRow({
				'id' : key,
				'snapshot' : value
				});
			userData.
			insertOrReplace().
			into(playlistsTable).
			values([row]).
			exec();
			userData.
			delete().
			from(songsTable).
			where(songsTable.playlist_id.eq(key)).
			exec();
			});
		//return playlists object from API call for further usage
		return json
	};

const updateSongs = async function (playlists) {
		//use playlists object from updatePlaylists to fetch 
		const json = await songRequests(token, playlists.update);
		console.log('inside data', json)
		//update songs table; API response is designed in a manner
		//such that the songs key holds an array of songs,
		//all of which are objects that match the table row schema
		json['songs'].forEach(song => {
			const row = songsTable.createRow(song);
			userData.
			insertOrReplace().
			into(songsTable).	
			values([row]).
			exec();
			});
			

		//for temporary testing!
		return json
	};


const getSongs = async function (limit) {
	const result = await userData.select().
		from(songsTable).
		orderBy(songsTable.unix, lf.Order.DESC).
		limit(limit).
		exec();
	return result
	
	}
	



