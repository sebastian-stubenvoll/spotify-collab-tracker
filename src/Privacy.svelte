<h1>
how does this website get my spotify data?
<p>
if you've authenticated with spotify and granted this website permission to access your playlist data all the requests are sent from <b>your browser directly to spotify</b>. this means none of your private spotify data is ever accessed by the server hosting this website.
</p>
how is my data stored?
<p>
all of your data is stored <b>locally</b> inside if your browser (usually indexedDB). this is only done to keep the number of requests as low as possible. you can delete the locally stored information at any point by clearing the stored data or clicking <button>here</button>.
</p>
i'm still not sure...
<p>
if you have any concers regarding security or privacy, feel free to check out the source code on github.
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
</style>
