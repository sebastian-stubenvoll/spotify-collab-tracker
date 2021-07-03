# a collaborative playlist tracker

## features

### currently implemented

I realize this is **very** basic right now, but more features are coming soon!

* show songs across all collaborative playlists, ordered chronologically
* keep scrolling to load older songs
* minimize amount of request by keeping a copy of the data in browser storage

### planned

* filter system; e.g. filter for a specific set of users/specific playlists etc.
* changes to the popups, e.g. a *go to top* button
* an activity page; see who/which playlists have been the most active
* themes!

## run this website locally

**This requires that you have node/npm installed.**

Follow these steps, if you want to run this website yourself:

Go to the [spotify developer portal](https://developer.spotify.com/), log in and
create an application. Make sure you add a callback URI for the adress you want
to host this page on, by default  

    http://localhost:5000

Once you're finished clone this repository by running  

    git clone https://github.com/sebastian-stubenvoll/spotify-collab-tracker

and create a file called settings.js in the root directory that looks like this

    export const clientID = YOURCLIENTID
    export const redirect_uri = YOURREDIRECTURI

where you replace `YOURCLIENTID` with the client ID from your spotify developer dashboard
and `YOURREDIRECTURI` with the redirect URI you added in your application settings.

Now run `npm i` to install all dependencies and finally run your application by executing

    npm run dev
