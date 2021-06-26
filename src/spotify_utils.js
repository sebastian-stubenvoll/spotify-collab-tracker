import { generateRandomString, challenge_from_verifier, to_unix } from './utils';

//******************************
//*******AUTHENTIFICATION*******
//******************************

const clientID = '0a004f36100a460ca97d2d99f485af2f';
const redirect_uri = 'http://localhost:5000';

export let token;
let refresh;
let expires_in;
let refresh_interval;

function createVerifier() {
    const v = generateRandomString();
    localStorage.setItem('verifier', v);
    return v
};

async function createChallenge(v) {
    const c = await challenge_from_verifier(v)
    return 'code_challenge=' + c
};

export async function createAuthURL () {
    const prefix = 'https://accounts.spotify.com/authorize?';
    const cID = 'client_id=' + clientID;
    const response_type = 'response_type=' + 'code';
    const callback = 'redirect_uri=' + encodeURIComponent(redirect_uri);
    const code_challenge_method = 'code_challenge_method=' + 'S256';
    const s = generateRandomString();
    localStorage.setItem('state', s);
    const ps = 'state=' + s
    const scope = 'scope=' + encodeURIComponent('user-read-private playlist-read-private playlist-read-collaborative');
    const c = await createChallenge(createVerifier());
    const params = [cID, response_type, callback, c, code_challenge_method, ps, scope].join('&');
    const url = prefix + params
    return url;
}


export async function getUserProfile() {
    const endpoint = 'https://api.spotify.com/v1/me';
    const res = await fetch(endpoint, {
        method: 'get',
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}}).
        catch(error => console.log(error));
    if (res.status == 200) {
        const json = await res.json();
        return json
    } else {
        return undefined //use this to check if currently stored token is valid!
    }}


export async function getAccessToken(params) {
    if (params.state != localStorage.getItem('state')) {
        return false
    } else {
        let postBody = [];
        const details = {
            'client_id' : clientID,
            'grant_type' : 'authorization_code',
            'code' : params.code,
            'redirect_uri' : redirect_uri,
            'code_verifier' : localStorage.getItem('verifier')
        };
        for (let property in details) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(details[property]);
            postBody.push(encodedKey + '=' + encodedValue);
        }
        postBody = postBody.join('&'); 
        const endpoint = 'https://accounts.spotify.com/api/token';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: postBody
        });
        if (res.status != 200) {
            return false
        } else {
            const json = await res.json()
            token = json.access_token;
            refresh = json.refresh_token;
            expires_in = json.expires_in*1000;
            localStorage.removeItem('verifier');
            refresh_interval = setInterval(refreshAccessToken, expires_in - (expires_in*0.1));
            return true
        }
    }
};


const refreshAccessToken = async function () {
    clearInterval(refresh_interval);
    console.log('Refreshing access token...');
    const endpoint = 'https://accounts.spotify.com/api/token';
    let postBody = [];
    const details = {
        'grant_type' : 'refresh_token',
        'refresh_token' : refresh,
        'client_id' : clientID
    };
    for (let property in details) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(details[property]);
        postBody.push(encodedKey + '=' + encodedValue);
    }
    postBody = postBody.join('&');
    const res =  await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: postBody
    });
    const json = await res.json();
    token = json.access_token;
    refresh = json.refresh_token;
    expires_in = json.expires_in*1000;
    refresh_interval = setInterval(refreshAccessToken, expires_in - (expires_in*0.1));
};


//******************************
//*********API FUNCTIONS********
//******************************
function authHeader (auth) {
    const header = {'Authorization' : 'Bearer ' + auth};
    return header
}

export async function playlistRequests (auth, playlists_input) {
    let endpoint = 'https://api.spotify.com/v1/me/playlists?limit=20';
    let send = true;
    let playlists = playlists_input;
    let delta = {'update' : {}, 'remove' : {}};

    while (send) {
        const res = await fetch(endpoint, {
            method: 'GET',
            headers : authHeader(auth)
        });
        const json = await res.json();
        for (let pl of json.items) {
            const pid = pl.id;
            const psn = pl.snapshot_id;
            const pco = pl.collaborative;
            if (pco) {
                if (!playlists.hasOwnProperty(pid)) {
                    delta.update[pid] = psn; 
                } else {
                    if (playlists[pid] != psn) {
                        delta['update'][pid] = psn;
                    }
                    delete playlists[pid];
                }
            }
            if (json.next != null) {
                endpoint = json.next;
            } else {
                send = false;
            }    
        }
    }
    delta.remove = playlists; 
    return delta
}

export async function songRequests (auth, playlists_input) {
    let endpoint = 'https://api.spotify.com/v1/playlists/'
    const playlists = playlists_input;    
    const params = {
        market: 'from_token',
        limit : '100',
        fields : 'name,id,external_urls,tracks.items(is_local,track(duration_ms,external_urls,name,popularity,id),added_at,added_by(id,external_urls,href),track.album(external_urls,name),track.artists(external_urls,name)),tracks(limit,next,offset)'
    };
    const altparams = {
        market: 'from_token',
        limit : '100',
        fields : 'items(is_local,track(duration_ms,external_urls,name,popularity,id),added_at,added_by(id,external_urls,href),track.album(external_urls,name),track.artists(external_urls,name)),limit,next,offset'
    };

    let usernames = {};
    let results = [];

    for (let pl in playlists) {
        let send = true;
        let url = new URL(endpoint + pl)
        let current_params = params;
        let container = undefined;
        url.search = new URLSearchParams(current_params).toString();

        while (send) {
            const res = await fetch(url, {
                method: 'GET',
                headers : authHeader(auth)
            });
            let json = await res.json();
            if (container != undefined) {
                container.tracks.items = json.items;
                container.tracks.next = json.next; 
                json = container;
            }
            for (let track of json.tracks.items) {
                try {
                    const unix = to_unix(track.added_at);

                    const subm_id = track.added_by.id;
                    const subm_link = track.added_by.external_urls.spotify;

                    const tr_title = track.track.name;
                    const tr_link = track.track.external_urls.spotify;
                    const tr_popularity = track.track.popularity;
                    const tr_islocal = track.is_local;
                    const tr_id = track.track.id;
                    const tr_duration = track.track.duration_ms;

                    const alb_name = track.track.album.name;
                    const alb_link = track.track.album.external_urls.spotify;

                    const pl_name = json.name;
                    const pl_link = json.external_urls.spotify;
                    const pl_id = json.id;

                    let artists = [];
                    for (let artist of track.track.artists) {
                        artists.push({name : artist.name, link : artist.external_urls.spotify});
                    } 

                    if (!usernames.hasOwnProperty(subm_id)) {
                        usernames[subm_id] = await getUsername(auth, subm_id);
                    }
                    const subm_name = usernames[subm_id][0];
                    let subm_images;
                    try {
                        subm_images = usernames[subm_id][1][0];
                    } catch {
                        subm_images = null;
                    }

                    const identifier = `${unix} ${pl_id} ${tr_id}`;

                    const result = {
                        uid : identifier,
                        unix : unix,
                        subm_name : subm_name,
                        subm_id : subm_id,
                        subm_link : subm_link,
                        subm_images : subm_images,
                        song_title : tr_title,
                        song_link : tr_link,
                        song_popularity : tr_popularity,
                        song_duration : tr_duration,
                        song_islocal : tr_islocal,
                        song_id : tr_id,
                        album_name : alb_name,
                        album_link : alb_link,
                        artists : artists,
                        playlist_name : pl_name,
                        playlist_link : pl_link,
                        playlist_id : pl_id
                    };

                    results.push(result);
                } catch {
                    //pass
                }

            }   
            if (json.tracks.next != null) {
                url = new URL(json.tracks.next);
                container = json;
                current_params = altparams;
            } else {
                send = false;
            }
        }
    }
    return { songs : results }
}


async function getUsername (auth, subm_id) {
    const url = 'https://api.spotify.com/v1/users/' + subm_id;
    const res = await fetch(url, {
        method: 'GET',
        headers: authHeader(auth)
    });
    const json = await res.json();
    const output = [json.display_name, json.images];
    return output
}
