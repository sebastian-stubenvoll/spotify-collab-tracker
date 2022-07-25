<script>
	import { deleteData } from '../utils/data.js'
	import { toast } from '@zerodevx/svelte-toast';

	const clearData = () => {
		deleteData();
		toast.push('All your data has been deleted!');
	};

</script>
<h1>
	how is my data accessed?
	<p>
		once you've logged in via spotify and granted the required permissions all the requests are sent from <b>your browser directly to spotify</b>. this means none of your private spotify data is ever accessed by the server hosting this website.
	</p>
how is my data stored?
<p>
	all of your data is stored <b>locally</b> inside your browser (indexedDB). this is only done to keep the number of requests as low as possible. you can delete the locally stored information at any point via your browser or by clicking <button on:click={clearData}><b>here</b></button>.
</p>
what data does this page store exactly?
<p>this webapp only stores the data that is necessary for functionality. right now this is a database of your collaborative playlists and some information required to log into spotify. in the future this may also include user settings such as themes. all the data is only stored locally (i.e. in your browser) and will never be stored on the server hosting this page (as it is completely static).</p>
i'm still not sure...
<p>
	if you have any remaining concerns, feel free to check out the <a href='https://github.com/sebastian-stubenvoll/spotify-collab-tracker' target='_blank'><b>source code</b></a>.
</p>
	</h1>


<style>
	h1 {
		color: indianred;
		font-size: 2em;
	}

	p {
		color: dimgrey;
		font-size: 0.5em;
		font-weight: 100;
		font-family: Georgia, 'Times New Roman', Times, serif;
		letter-spacing: 0.02em;
	}

	a {
		color: inherit;
		font-weight: 1000;
	}

	a:hover {
		text-decoration: none;
	}

	button {
		font-size: inherit;
		background: inherit;
		color: inherit;
		padding: inherit;
		border: none;
		cursor: pointer;
	}

	button:hover {
		text-decoration: none;
	}

	button:focus {
		background: none;
	}
</style>
